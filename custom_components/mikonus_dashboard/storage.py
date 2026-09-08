"""Atomic, entry-owned scene snapshots and bounded durable retry receipts."""

import asyncio
import hashlib
import json
import logging
from copy import deepcopy
from datetime import datetime, timezone

from homeassistant.helpers.storage import Store

from .const import (
    CONTRACT_VERSION,
    DOMAIN,
    MAX_REQUESTS_PER_SCENE,
    MAX_SCENES,
    STORAGE_MINOR_VERSION,
    STORAGE_VERSION,
    VERSION,
)
from .models import ContractError
from .validation import validate_scene

_LOGGER = logging.getLogger(__name__)


def digest(value):
    """Object key order/JSON whitespace irrelevant; all values remain significant."""
    raw = json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def validate_storage(data):
    if (
        not isinstance(data, dict)
        or set(data) != {"scenes"}
        or not isinstance(data["scenes"], dict)
        or len(data["scenes"]) > MAX_SCENES
    ):
        raise ValueError("Invalid scene store")
    for scene_id, record in data["scenes"].items():
        validate_scene(record["scene"])
        if (
            scene_id != record["scene"]["sceneId"]
            or type(record["revision"]) is not int
            or record["revision"] < 1
            or digest(record["scene"]) != record["digest"]
        ):
            raise ValueError("Invalid persisted scene identity/revision/digest")
        datetime.fromisoformat(record["publishedAt"])
        requests = record["requests"]
        if not isinstance(requests, dict) or len(requests) > MAX_REQUESTS_PER_SCENE:
            raise ValueError("Invalid retry ledger")
        for request_id, entry in requests.items():
            receipt = entry["receipt"]
            if (
                not isinstance(request_id, str)
                or not isinstance(entry["fingerprint"], str)
                or receipt["sceneId"] != scene_id
                or not 1 <= receipt["revision"] <= record["revision"]
            ):
                raise ValueError("Invalid persisted receipt")
    return data


class DashboardStorage(Store):
    async def _async_migrate_func(self, old_major_version, old_minor_version, old_data):
        # Internal pre-release 1.0 stored records without a retry ledger.
        if old_major_version != 1 or old_minor_version != 0:
            raise ValueError(
                "Unsupported Mikonus storage version; restore a compatible backup"
            )
        migrated = deepcopy(old_data)
        for record in migrated["scenes"].values():
            record["requests"] = {}
        return validate_storage(migrated)


class SceneStore:
    def __init__(self, hass, instance_id):
        self.hass = hass
        self.instance_id = instance_id
        self.key = f"{DOMAIN}.{instance_id}"
        self.storage = self._storage()
        self.scenes = {}
        self.listeners = set()
        self.lock = asyncio.Lock()
        self.closed = False

    def _storage(self):
        return DashboardStorage(
            self.hass,
            STORAGE_VERSION,
            self.key,
            minor_version=STORAGE_MINOR_VERSION,
            private=True,
            atomic_writes=True,
            serialize_in_event_loop=False,
        )

    async def async_load(self):
        data = await self.storage.async_load()
        self.scenes = validate_storage(data)["scenes"] if data is not None else {}

    def metadata(self, record):
        return {
            "sceneId": record["scene"]["sceneId"],
            "projectName": record["scene"]["name"],
            "schemaVersion": 2,
            "revision": record["revision"],
            "digest": record["digest"],
            "publishedAt": record["publishedAt"],
            "generatorMetadata": record["scene"].get("metadata") or {},
        }

    def get(self, scene_id):
        self.ensure_open()
        if scene_id not in self.scenes:
            raise ContractError(
                "scene_not_found", "This scene has not been published.", 404
            )
        return self.scenes[scene_id]

    def ensure_open(self):
        if self.closed:
            raise ContractError(
                "integration_not_setup", "Set up or reload Mikonus Dashboard.", 503
            )

    def subscribe(self, callback):
        self.ensure_open()
        self.listeners.add(callback)
        return lambda: self.listeners.discard(callback)

    def _notify(self, event):
        for listener in tuple(self.listeners):
            try:
                listener(event)
            except (
                Exception
            ):  # A disconnected frontend cannot invalidate durable publication.
                _LOGGER.exception("Mikonus scene subscriber failed")

    async def async_close(self):
        async with self.lock:
            self.closed = True
            self._notify({"type": "unavailable", "code": "integration_not_setup"})
            self.listeners.clear()

    async def async_publish(self, payload):
        # Survive HTTP cancellation. HA owns and awaits this finite task at shutdown.
        return await asyncio.shield(
            self.hass.async_create_task(self._publish(payload), "Mikonus scene publish")
        )

    async def async_replace(self, payload):
        """Atomically exchange one owned scene for one validated new scene."""
        return await asyncio.shield(
            self.hass.async_create_task(
                self._replace(payload), "Mikonus scene replacement"
            )
        )

    async def async_delete(self, scene_id, expected_revision):
        """Delete exactly one published HA scene without touching its source project."""
        return await asyncio.shield(
            self.hass.async_create_task(
                self._delete(scene_id, expected_revision), "Mikonus scene deletion"
            )
        )

    async def _publish(self, payload):
        async with self.lock:
            self.ensure_open()
            if payload["instanceId"] != self.instance_id:
                raise ContractError(
                    "wrong_instance",
                    "Metadata and publish must address the same configured instance.",
                    409,
                )
            scene = validate_scene(payload["scene"])
            scene_id = scene["sceneId"]
            current = self.scenes.get(scene_id)
            fingerprint = digest(payload)
            request_id = payload["requestId"]
            if current and (previous := current["requests"].get(request_id)):
                if previous["fingerprint"] != fingerprint:
                    raise ContractError(
                        "request_id_conflict",
                        "requestId was already used with different request content.",
                        409,
                    )
                return deepcopy(previous["receipt"])
            revision = current["revision"] if current else 0
            if payload["expectedRevision"] != revision:
                raise ContractError(
                    "revision_conflict",
                    "Refresh metadata before a new publish attempt.",
                    409,
                    currentRevision=revision,
                )
            if not current and len(self.scenes) >= MAX_SCENES:
                raise ContractError(
                    "scene_limit_reached",
                    "Maximum number of stored scenes reached.",
                    409,
                )
            content_digest = digest(scene)
            updated = current is None or current["digest"] != content_digest
            record = deepcopy(current) if current else {"requests": {}}
            if updated:
                record.update(
                    scene=deepcopy(scene),
                    revision=revision + 1,
                    digest=content_digest,
                    publishedAt=datetime.now(timezone.utc).isoformat(),
                )
            receipt = {
                "integration": DOMAIN,
                "integrationVersion": VERSION,
                "contractVersion": CONTRACT_VERSION,
                "instanceId": self.instance_id,
                "requestId": request_id,
                **self.metadata(record),
                "updated": updated,
            }
            record["requests"][request_id] = {
                "fingerprint": fingerprint,
                "receipt": receipt,
            }
            while len(record["requests"]) > MAX_REQUESTS_PER_SCENE:
                del record["requests"][next(iter(record["requests"]))]
            candidate = {"scenes": {**self.scenes, scene_id: record}}
            await self._commit(candidate)
            self.scenes = candidate["scenes"]
            if updated:
                self.hass.bus.async_fire(
                    "mikonus_dashboard_published",
                    {"sceneId": scene_id, "revision": record["revision"]},
                )
                self._notify(
                    {
                        "type": "updated",
                        "sceneId": scene_id,
                        "revision": record["revision"],
                    }
                )
            return deepcopy(receipt)

    async def _replace(self, payload):
        async with self.lock:
            self.ensure_open()
            if payload["instanceId"] != self.instance_id:
                raise ContractError(
                    "wrong_instance",
                    "Metadata and replacement must address the same configured instance.",
                    409,
                )

            scene = validate_scene(payload["scene"])
            scene_id = scene["sceneId"]
            replaced_scene_id = payload["replacedSceneId"]
            if scene_id == replaced_scene_id:
                raise ContractError(
                    "invalid_request",
                    "Replacement requires two different scene identities.",
                )

            current = self.scenes.get(scene_id)
            fingerprint = digest(payload)
            request_id = payload["requestId"]
            if current and (previous := current["requests"].get(request_id)):
                if previous["fingerprint"] != fingerprint:
                    raise ContractError(
                        "request_id_conflict",
                        "requestId was already used with different request content.",
                        409,
                    )
                return deepcopy(previous["receipt"])

            revision = current["revision"] if current else 0
            if payload["expectedRevision"] != revision:
                raise ContractError(
                    "revision_conflict",
                    "Refresh metadata before a new replacement attempt.",
                    409,
                    currentRevision=revision,
                )
            replaced = self.scenes.get(replaced_scene_id)
            replaced_revision = replaced["revision"] if replaced else 0
            if payload["replacedExpectedRevision"] != replaced_revision:
                raise ContractError(
                    "revision_conflict",
                    "The scene selected for replacement has changed.",
                    409,
                    currentRevision=replaced_revision,
                )
            if not replaced:
                raise ContractError(
                    "replacement_conflict",
                    "The scene selected for replacement no longer exists.",
                    409,
                )
            if not self._is_mikonus_managed(replaced) or not self._is_mikonus_scene(
                scene
            ):
                raise ContractError(
                    "foreign_scene",
                    "Only Mikonus-managed scenes can participate in replacement.",
                )

            content_digest = digest(scene)
            record = {
                "scene": deepcopy(scene),
                "revision": revision + 1,
                "digest": content_digest,
                "publishedAt": datetime.now(timezone.utc).isoformat(),
                "requests": {},
            }
            receipt = {
                "integration": DOMAIN,
                "integrationVersion": VERSION,
                "contractVersion": CONTRACT_VERSION,
                "instanceId": self.instance_id,
                "requestId": request_id,
                **self.metadata(record),
                "updated": True,
                "replacedSceneId": replaced_scene_id,
            }
            record["requests"][request_id] = {
                "fingerprint": fingerprint,
                "receipt": receipt,
            }
            candidate_scenes = {
                key: value
                for key, value in self.scenes.items()
                if key != replaced_scene_id
            }
            candidate_scenes[scene_id] = record
            candidate = {"scenes": candidate_scenes}
            await self._commit(candidate)
            self.scenes = candidate_scenes
            self.hass.bus.async_fire(
                "mikonus_dashboard_replaced",
                {
                    "replacedSceneId": replaced_scene_id,
                    "sceneId": scene_id,
                    "revision": record["revision"],
                },
            )
            self._notify(
                {
                    "type": "removed",
                    "sceneId": replaced_scene_id,
                }
            )
            self._notify(
                {
                    "type": "updated",
                    "sceneId": scene_id,
                    "revision": record["revision"],
                }
            )
            return deepcopy(receipt)

    async def _delete(self, scene_id, expected_revision):
        async with self.lock:
            self.ensure_open()
            record = self.get(scene_id)
            if expected_revision != record["revision"]:
                raise ContractError(
                    "revision_conflict",
                    "The scene selected for deletion has changed.",
                    409,
                    currentRevision=record["revision"],
                )
            metadata = self.metadata(record)
            candidate_scenes = {
                key: value for key, value in self.scenes.items() if key != scene_id
            }
            await self._commit({"scenes": candidate_scenes})
            self.scenes = candidate_scenes
            event = {
                "type": "deleted",
                "sceneId": scene_id,
                "revision": record["revision"],
            }
            self.hass.bus.async_fire("mikonus_dashboard_published", event)
            self._notify(event)
            return deepcopy(metadata)

    @staticmethod
    def _is_mikonus_scene(scene):
        generator = (scene.get("metadata") or {}).get("generator")
        return (
            isinstance(scene.get("sceneId"), str)
            and scene["sceneId"].startswith("mikonus:")
            and isinstance(generator, str)
            and generator.startswith("mikonus-")
        )

    @classmethod
    def _is_mikonus_managed(cls, record):
        return cls._is_mikonus_scene(record["scene"])

    async def _commit(self, candidate):
        try:
            await self.storage.async_save(candidate)
            # HA Store logs some write failures instead of propagating them. Use its
            # public read API to verify durability before issuing any receipt/event.
            persisted = await self._storage().async_load()
            if persisted != candidate:
                raise ValueError("Storage verification failed")
        except Exception as err:
            _LOGGER.error("Mikonus persistence failed: %s", type(err).__name__)
            raise ContractError(
                "storage_error",
                "Scene could not be durably stored; retry the exact request.",
                503,
            ) from err

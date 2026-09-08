"""Authenticated native HA HTTP contract, version 1."""

import asyncio
import json
import re

from homeassistant.components.http import HomeAssistantView
from homeassistant.components.http.const import KEY_HASS, KEY_HASS_USER

from .access import get_store
from .const import (
    CONTRACT_VERSION,
    DOMAIN,
    MAX_PAYLOAD_BYTES,
    MAX_REQUESTS_PER_SCENE,
    MAX_SCENES,
    VERSION,
)
from .models import ContractError


def reject_constant(value):
    raise ValueError("Non-finite JSON number")


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON key")
        result[key] = value
    return result


class MetadataView(HomeAssistantView):
    url = "/api/mikonus_dashboard/metadata"
    name = "api:mikonus_dashboard:metadata"
    requires_auth = True

    async def get(self, request):
        try:
            store = get_store(request.app[KEY_HASS])
            return self.json(
                {
                    "integration": DOMAIN,
                    "integrationVersion": VERSION,
                    "contractVersion": CONTRACT_VERSION,
                    "instanceId": store.instance_id,
                    "supportedSchemaVersions": [2],
                    "preferredSchemaVersion": 2,
                    "publishSupported": True,
                    "publishRequiresAdmin": True,
                    "maxPayloadBytes": MAX_PAYLOAD_BYTES,
                    "maxScenes": MAX_SCENES,
                    "capabilities": {
                        "multipleScenes": True,
                        "subscriptions": True,
                        "expectedRevisionRequired": True,
                        "requestIdRequired": True,
                        "retryReceiptsPerScene": MAX_REQUESTS_PER_SCENE,
                        "assets": "catalogKeysOnly",
                        "sceneDeletion": True,
                        "atomicSceneReplacement": True,
                    },
                    "scenes": [
                        store.metadata(record)
                        for _, record in sorted(store.scenes.items())
                    ],
                },
                headers={"Cache-Control": "no-store"},
            )
        except ContractError as err:
            return self.json(err.body, status_code=err.status)


class PublishView(HomeAssistantView):
    url = "/api/mikonus_dashboard/scene"
    name = "api:mikonus_dashboard:scene"
    requires_auth = True

    async def put(self, request):
        return await self._put(request, replacing=False)

    async def _put(self, request, *, replacing):
        try:
            if not request[KEY_HASS_USER].is_admin:
                raise ContractError(
                    "forbidden",
                    "Publishing requires a Home Assistant administrator.",
                    403,
                )
            store = get_store(request.app[KEY_HASS])
            if (
                request.content_type != "application/json"
                or request.headers.get("Content-Encoding", "identity") != "identity"
            ):
                raise ContractError(
                    "invalid_request",
                    "Use application/json without content encoding.",
                    400,
                )
            if (
                request.content_length is not None
                and request.content_length > MAX_PAYLOAD_BYTES
            ):
                raise ContractError(
                    "payload_too_large",
                    "Publish exceeds maxPayloadBytes.",
                    413,
                    maxPayloadBytes=MAX_PAYLOAD_BYTES,
                )
            body = bytearray()
            async with asyncio.timeout(30):
                async for chunk in request.content.iter_chunked(65536):
                    body.extend(chunk)
                    if len(body) > MAX_PAYLOAD_BYTES:
                        raise ContractError(
                            "payload_too_large",
                            "Publish exceeds maxPayloadBytes.",
                            413,
                            maxPayloadBytes=MAX_PAYLOAD_BYTES,
                        )
            try:
                payload = json.loads(
                    body.decode("utf-8"),
                    parse_constant=reject_constant,
                    object_pairs_hook=unique_object,
                )
            except (ValueError, RecursionError):
                raise ContractError(
                    "invalid_json", "Expected unique-key, finite UTF-8 JSON."
                ) from None
            expected_fields = {
                "instanceId",
                "requestId",
                "expectedRevision",
                "scene",
            }
            if replacing:
                expected_fields.update({"replacedSceneId", "replacedExpectedRevision"})
            if not isinstance(payload, dict) or set(payload) != expected_fields:
                raise ContractError(
                    "invalid_request",
                    "Expected instanceId, requestId, expectedRevision and scene.",
                )
            if (
                not isinstance(payload["instanceId"], str)
                or not isinstance(payload["requestId"], str)
                or not re.fullmatch(r"[A-Za-z0-9_-]{16,128}", payload["requestId"])
            ):
                raise ContractError(
                    "invalid_request",
                    "Invalid instanceId or requestId (16–128 URL-safe characters).",
                )
            if (
                type(payload["expectedRevision"]) is not int
                or not 0 <= payload["expectedRevision"] <= 9007199254740991
            ):
                raise ContractError(
                    "invalid_request",
                    "expectedRevision must be a nonnegative safe integer.",
                )
            if replacing and (
                not isinstance(payload["replacedSceneId"], str)
                or not payload["replacedSceneId"]
                or type(payload["replacedExpectedRevision"]) is not int
                or not 1 <= payload["replacedExpectedRevision"] <= 9007199254740991
            ):
                raise ContractError(
                    "invalid_request",
                    "Invalid replacedSceneId or replacedExpectedRevision.",
                )
            receipt = (
                await store.async_replace(payload)
                if replacing
                else await store.async_publish(payload)
            )
            return self.json(receipt, headers={"Cache-Control": "no-store"})
        except TimeoutError:
            return self.json(
                {"code": "request_timeout", "message": "Request body timeout."},
                status_code=408,
            )
        except ContractError as err:
            return self.json(err.body, status_code=err.status)


class ReplaceView(PublishView):
    url = "/api/mikonus_dashboard/scene/replace"
    name = "api:mikonus_dashboard:scene:replace"

    async def put(self, request):
        return await self._put(request, replacing=True)

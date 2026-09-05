"""Resolve the current entry and apply HA's own entity read permissions."""

from copy import deepcopy

from homeassistant.auth.permissions.const import POLICY_READ

from .const import DOMAIN
from .models import ContractError


def get_store(hass):
    for entry in hass.config_entries.async_entries(DOMAIN):
        runtime = getattr(entry, "runtime_data", None)
        if runtime is not None and not runtime.store.closed:
            return runtime.store
    raise ContractError(
        "integration_not_setup",
        "Add Mikonus Dashboard in Settings → Devices & services.",
        503,
    )


def delivery(store, scene_id, user):
    record = store.get(scene_id)
    scene = deepcopy(record["scene"])
    redacted = False
    for floor in scene["floors"]:
        for key in ("objects", "doors", "windows"):
            for item in floor[key]:
                binding = item.get("binding")
                if binding and not user.permissions.check_entity(
                    binding["deviceId"], POLICY_READ
                ):
                    del item["binding"]
                    redacted = True
    return {
        "scene": scene,
        "metadata": {**store.metadata(record), "bindingsRedacted": redacted},
    }

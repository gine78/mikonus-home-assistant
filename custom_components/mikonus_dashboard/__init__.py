"""Home Assistant host for the canonical Mikonus Dashboard product."""

import logging

from homeassistant.exceptions import ConfigEntryNotReady

from .http import MetadataView, PublishView
from .models import DashboardRuntime, MikonusDashboardConfigEntry
from .storage import SceneStore
from .websocket import register_commands

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass, config):
    # Register routes once for the integration, before any entry runtime exists.
    # Handlers resolve the active entry on each request, including after reload.
    hass.http.register_view(MetadataView())
    hass.http.register_view(PublishView())
    register_commands(hass)
    return True


async def async_setup_entry(hass, entry: MikonusDashboardConfigEntry):
    store = SceneStore(hass, entry.entry_id)
    try:
        await store.async_load()
    except Exception as err:
        _LOGGER.error("Mikonus storage could not be loaded: %s", type(err).__name__)
        raise ConfigEntryNotReady(
            "Mikonus storage is invalid or unavailable; restore from backup"
        ) from err
    entry.runtime_data = DashboardRuntime(store)
    hass.bus.async_fire("mikonus_dashboard_ready")
    return True


async def async_unload_entry(hass, entry: MikonusDashboardConfigEntry):
    await entry.runtime_data.store.async_close()
    return True


async def async_remove_entry(hass, entry: MikonusDashboardConfigEntry):
    # Explicit entry removal deletes its scenes and retry receipts. Unload/reload does not.
    await SceneStore(hass, entry.entry_id).storage.async_remove()

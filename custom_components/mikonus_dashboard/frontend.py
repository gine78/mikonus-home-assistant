"""Serve and load the bundled card using Home Assistant's frontend APIs."""

from asyncio import Lock
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.loader import async_get_integration

from .const import DOMAIN

URL_PATH = "/mikonus_dashboard/frontend/mikonus-3d-card.js"
DATA_FRONTEND = f"{DOMAIN}_frontend"


async def async_register_frontend(hass):
    """Keep one static route per HA process and one active version URL."""
    state = hass.data.setdefault(
        DATA_FRONTEND, {"lock": Lock(), "static": False, "url": None}
    )
    async with state["lock"]:
        if not state["static"]:
            await hass.http.async_register_static_paths(
                [
                    StaticPathConfig(
                        URL_PATH,
                        str(Path(__file__).parent / "frontend" / "mikonus-3d-card.js"),
                        False,
                    )
                ]
            )
            state["static"] = True
        integration = await async_get_integration(hass, DOMAIN)
        url = f"{URL_PATH}?v={integration.version}"
        if state["url"] == url:
            return
        if state["url"] is not None:
            remove_extra_js_url(hass, state["url"])
        add_extra_js_url(hass, url)
        state["url"] = url


def unregister_frontend(hass):
    """Stop advertising the module; existing browser elements live until reload.

    HA static routes have process lifetime and are reused when the entry reloads.
    """
    if (state := hass.data.get(DATA_FRONTEND)) and state["url"] is not None:
        remove_extra_js_url(hass, state["url"])
        state["url"] = None

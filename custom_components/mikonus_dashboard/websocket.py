"""Small commands on the existing authenticated HA frontend connection."""

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import callback

from .access import delivery, get_store
from .models import ContractError


def positive_safe_integer(value):
    if type(value) is not int or not 1 <= value <= 9007199254740991:
        raise vol.Invalid("Expected a positive safe integer")
    return value


def register_commands(hass):
    for command in (scene_list, scene_get, scene_delete, scene_subscribe, scene_watch):
        websocket_api.async_register_command(hass, command)


@websocket_api.websocket_command({vol.Required("type"): "mikonus_dashboard/scene/list"})
@callback
def scene_list(hass, connection, msg):
    try:
        store = get_store(hass)
        connection.send_result(
            msg["id"],
            {"scenes": [store.metadata(r) for _, r in sorted(store.scenes.items())]},
        )
    except ContractError as err:
        connection.send_error(msg["id"], err.code, str(err))


@websocket_api.websocket_command(
    {vol.Required("type"): "mikonus_dashboard/scene/get", vol.Required("scene_id"): str}
)
@callback
def scene_get(hass, connection, msg):
    try:
        connection.send_result(
            msg["id"], delivery(get_store(hass), msg["scene_id"], connection.user)
        )
    except ContractError as err:
        connection.send_error(msg["id"], err.code, str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "mikonus_dashboard/scene/delete",
        vol.Required("scene_id"): str,
        vol.Required("expected_revision"): positive_safe_integer,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def scene_delete(hass, connection, msg):
    """Delete one selected published scene; native HA admin auth is authoritative."""
    try:
        metadata = await get_store(hass).async_delete(
            msg["scene_id"], msg["expected_revision"]
        )
        connection.send_result(msg["id"], {"deleted": True, "scene": metadata})
    except ContractError as err:
        connection.send_error(msg["id"], err.code, str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "mikonus_dashboard/scene/subscribe",
        vol.Required("scene_id"): str,
    }
)
@callback
def scene_subscribe(hass, connection, msg):
    try:
        store = get_store(hass)
        record = store.get(msg["scene_id"])

        @callback
        def notify(event):
            if (
                event.get("sceneId") == msg["scene_id"]
                or event["type"] == "unavailable"
            ):
                connection.send_event(msg["id"], event)

        unsubscribe_store = store.subscribe(notify)

        @callback
        def reattach(_event):
            nonlocal unsubscribe_store
            unsubscribe_store()
            try:
                current = get_store(hass)
                record = current.get(msg["scene_id"])
                unsubscribe_store = current.subscribe(notify)
                notify(
                    {
                        "type": "snapshot",
                        "sceneId": msg["scene_id"],
                        "revision": record["revision"],
                    }
                )
            except ContractError as err:
                notify({"type": "unavailable", "code": err.code})

        unsubscribe_ready = hass.bus.async_listen("mikonus_dashboard_ready", reattach)

        @callback
        def unsubscribe():
            unsubscribe_store()
            unsubscribe_ready()

        connection.subscriptions[msg["id"]] = unsubscribe
        connection.send_result(msg["id"])
        # Snapshot closes load/subscribe and reconnect races without polling.
        connection.send_event(
            msg["id"],
            {
                "type": "snapshot",
                "sceneId": msg["scene_id"],
                "revision": record["revision"],
            },
        )
    except ContractError as err:
        connection.send_error(msg["id"], err.code, str(err))


@websocket_api.websocket_command(
    {vol.Required("type"): "mikonus_dashboard/scene/watch"}
)
@callback
def scene_watch(hass, connection, msg):
    """Observe readiness/publication even before an entry or selected scene exists.

    This authenticated command deliberately carries only lifecycle/metadata, so
    regular dashboard users need no admin-only event-bus subscription.
    """

    @callback
    def ready(_event):
        connection.send_event(msg["id"], {"type": "ready"})

    @callback
    def published(event):
        connection.send_event(msg["id"], {"type": "updated", **event.data})

    remove_ready = hass.bus.async_listen("mikonus_dashboard_ready", ready)
    remove_publish = hass.bus.async_listen("mikonus_dashboard_published", published)
    remove_replace = hass.bus.async_listen("mikonus_dashboard_replaced", published)

    @callback
    def unsubscribe():
        remove_ready()
        remove_publish()
        remove_replace()

    connection.subscriptions[msg["id"]] = unsubscribe
    connection.send_result(msg["id"])

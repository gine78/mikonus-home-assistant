"""Validate the existing portable Scene v2; never normalize authored geometry.

Unknown fields are rejected so tokens, live states and unreviewed provider/asset
extensions cannot accidentally become part of the persistent contract.
"""

import math
import re

from .models import ContractError

SCENE_ID = re.compile(r"mikonus:[A-Za-z0-9][A-Za-z0-9:_-]{0,190}\Z")
ENTITY_ID = re.compile(r"[a-z0-9_]+\.[a-z0-9_]+\Z")


def fail(path, message, code="invalid_scene"):
    raise ContractError(code, message, path=path)


def obj(value, required, optional, path):
    if not isinstance(value, dict):
        fail(path, "Expected an object.")
    if set(value) - set(required) - set(optional) or set(required) - set(value):
        fail(path, "Missing or unknown contract fields.")


def text(value, path, limit=256):
    if (
        not isinstance(value, str)
        or not value.strip()
        or len(value) > limit
        or any(ord(c) < 32 or 0xD800 <= ord(c) <= 0xDFFF for c in value)
    ):
        fail(path, "Expected a non-empty bounded string.")


def number(value, path, positive=False):
    if (
        type(value) not in (int, float)
        or not math.isfinite(value)
        or abs(value) > 1e9
        or (positive and value <= 0)
    ):
        fail(path, "Expected a finite metric number within bounds.")


def vector(value, keys, path, positive=False):
    obj(value, keys, (), path)
    for key in keys:
        number(value[key], f"{path}.{key}", positive)


def material(value, path):
    obj(
        value,
        ("materialKey", "baseColor", "roughness", "metallic", "opacity"),
        ("pattern",),
        path,
    )
    for key in ("materialKey", "baseColor"):
        text(value[key], f"{path}.{key}")
    for key in ("roughness", "metallic", "opacity"):
        number(value[key], f"{path}.{key}")
        if not 0 <= value[key] <= 1:
            fail(path, "Material fraction must be between 0 and 1.")
    if value.get("pattern") is not None:
        p = value["pattern"]
        obj(p, ("kind", "elementSize", "lineWidth", "orientation"), (), path)
        for key in ("kind", "orientation"):
            text(p[key], path)
        for key in ("elementSize", "lineWidth"):
            number(p[key], path, positive=True)


def binding(value, path):
    if not isinstance(value, dict):
        fail(path, "Expected a binding object.", "invalid_binding")
    if value.get("provider") != "homeAssistant":
        fail(path, "Only homeAssistant bindings are accepted.", "foreign_provider")
    if (
        set(value) - {"provider", "deviceId", "capability", "slot"}
        or not isinstance(value.get("capability"), str)
        or not value["capability"].strip()
        or len(value["capability"]) > 128
        or any(ord(c) < 32 or 0xD800 <= ord(c) <= 0xDFFF for c in value["capability"])
    ):
        fail(path, "Invalid binding fields or capability.", "invalid_binding")
    if (
        not isinstance(value.get("deviceId"), str)
        or len(value["deviceId"]) > 255
        or not ENTITY_ID.fullmatch(value["deviceId"])
    ):
        fail(path, "deviceId must be a Home Assistant entity ID.", "invalid_binding")
    if value.get("slot") is not None:
        fail(
            path,
            "Published HA bindings require concrete deviceId, not slots.",
            "invalid_binding",
        )


def validate_scene(scene):
    if not isinstance(scene, dict):
        fail("$", "Scene must be an object.")
    if type(scene.get("schemaVersion")) is not int or scene["schemaVersion"] != 2:
        raise ContractError(
            "unsupported_schema_version",
            "Only Dashboard Scene v2 is supported.",
            supportedSchemaVersions=[2],
        )
    if not isinstance(scene.get("sceneId"), str) or not SCENE_ID.fullmatch(
        scene["sceneId"]
    ):
        fail(
            "sceneId",
            "Expected a stable mikonus: scene ID (maximum 199 characters).",
            "invalid_scene_id",
        )
    obj(
        scene,
        ("schemaVersion", "sceneId", "name", "defaultFloorId", "floors"),
        ("metadata",),
        "$",
    )
    text(scene["name"], "name")
    text(scene["defaultFloorId"], "defaultFloorId")
    if scene.get("metadata") is not None:
        metadata = scene["metadata"]
        obj(
            metadata,
            (),
            (
                "generator",
                "generatedAt",
                "revision",
                "modelNorthDegrees",
                "solarLocation",
            ),
            "metadata",
        )
        for k in ("generator", "generatedAt", "revision"):
            v = metadata.get(k)
            if v is not None:
                text(v, f"metadata.{k}")
        if metadata.get("modelNorthDegrees") is not None:
            number(metadata["modelNorthDegrees"], "metadata.modelNorthDegrees")
        if metadata.get("solarLocation") is not None:
            location = metadata["solarLocation"]
            obj(location, ("latitude", "longitude"), (), "metadata.solarLocation")
            number(location["latitude"], "metadata.solarLocation.latitude")
            number(location["longitude"], "metadata.solarLocation.longitude")
            if not -90 <= location["latitude"] <= 90:
                fail("metadata.solarLocation.latitude", "Expected -90…90 degrees.")
            if not -180 <= location["longitude"] <= 180:
                fail("metadata.solarLocation.longitude", "Expected -180…180 degrees.")
    floors = scene["floors"]
    if not isinstance(floors, list) or not 1 <= len(floors) <= 16:
        fail("floors", "Expected 1–16 floors.")
    all_ids = set()
    totals = dict.fromkeys(("rooms", "walls", "doors", "windows", "objects"), 0)
    limits = dict(zip(totals, (256, 4096, 1024, 2048, 8192), strict=True))
    floor_ids = set()

    def identity(item, path):
        text(item.get("id"), path + ".id")
        if item["id"] in all_ids:
            fail(path, "IDs must be unique throughout the scene.")
        all_ids.add(item["id"])

    for i, floor in enumerate(floors):
        path = f"floors[{i}]"
        obj(floor, ("id", "name", *totals), ("level", "sortOrder", "elevation"), path)
        identity(floor, path)
        floor_ids.add(floor["id"])
        text(floor["name"], path + ".name")
        for key in ("level", "sortOrder", "elevation"):
            if floor.get(key) is not None:
                number(floor[key], path + "." + key)
                if key != "elevation" and type(floor[key]) is not int:
                    fail(path, "Level and sortOrder must be integers.")
        for key in totals:
            if not isinstance(floor[key], list):
                fail(path + "." + key, "Expected an array.")
            totals[key] += len(floor[key])
            if totals[key] > limits[key]:
                fail(path, "Scene exceeds the shared collection limits.")
        wall_ids = {
            w.get("id")
            for w in floor["walls"]
            if isinstance(w, dict) and isinstance(w.get("id"), str)
        }
        for collection in totals:
            for j, item in enumerate(floor[collection]):
                p = f"{path}.{collection}[{j}]"
                if collection == "rooms":
                    obj(
                        item,
                        ("id", "name", "polygon", "elevation", "floorThickness"),
                        ("appearance", "material"),
                        p,
                    )
                    text(item["name"], p)
                    number(item["elevation"], p)
                    number(item["floorThickness"], p, True)
                    if (
                        not isinstance(item["polygon"], list)
                        or not 3 <= len(item["polygon"]) <= 1024
                    ):
                        fail(p, "Room requires 3–1024 polygon points.")
                    for point in item["polygon"]:
                        vector(point, ("x", "z"), p)
                    if item.get("material") is not None:
                        material(item["material"], p)
                elif collection == "walls":
                    obj(
                        item,
                        ("id", "start", "end", "baseY", "height", "thickness"),
                        ("appearance", "materials"),
                        p,
                    )
                    for key in ("start", "end"):
                        vector(item[key], ("x", "z"), p)
                    if item["start"] == item["end"]:
                        fail(p, "Wall must have nonzero length.")
                    for key in ("baseY", "height", "thickness"):
                        number(item[key], p, key != "baseY")
                else:
                    optional = ("appearance", "binding")
                    if collection == "objects":
                        obj(
                            item,
                            ("id", "kind", "position", "rotation", "size"),
                            (
                                *optional,
                                "visualType",
                                "shape",
                                "assetKey",
                                "variantKey",
                                "dimensions",
                                "parameters",
                            ),
                            p,
                        )
                        if item["kind"] not in ("light", "furniture", "decor"):
                            fail(p, "Unsupported object kind.")
                        if item.get("shape") is not None and item["shape"] not in (
                            "box",
                            "cylinder",
                            "ellipsoid",
                        ):
                            fail(p, "Unsupported object shape.")
                        for key in ("visualType", "assetKey", "variantKey"):
                            if item.get(key) is not None:
                                text(item[key], p)
                        # Asset keys are catalog identities, never fetchable URLs or paths.
                        if item.get("assetKey") is not None and not re.fullmatch(
                            r"[A-Za-z0-9_.:-]+", item["assetKey"]
                        ):
                            fail(p, "assetKey must be a catalog key, not a URL/path.")
                        if item.get("dimensions") is not None:
                            vector(
                                item["dimensions"],
                                ("width", "depth", "height"),
                                p,
                                True,
                            )
                        if item.get("parameters") is not None:
                            if (
                                not isinstance(item["parameters"], dict)
                                or len(item["parameters"]) > 128
                            ):
                                fail(p, "Invalid parameters.")
                            for key, value in item["parameters"].items():
                                text(key, p)
                                if type(value) in (float, int):
                                    number(value, p)
                                elif isinstance(value, str):
                                    text(value, p)
                                elif type(value) is not bool:
                                    fail(p, "Parameters must be scalar values.")
                    else:
                        obj(
                            item,
                            ("id", "position", "rotation", "size"),
                            (*optional, "wallId", "openAngle", "materials"),
                            p,
                        )
                        if item.get("wallId") is not None and (
                            not isinstance(item["wallId"], str)
                            or item["wallId"] not in wall_ids
                        ):
                            fail(p, "Opening must reference a wall on its own floor.")
                        if item.get("openAngle") is not None:
                            number(item["openAngle"], p)
                    vector(item["position"], ("x", "y", "z"), p)
                    vector(item["rotation"], ("y",), p)
                    vector(item["size"], ("width", "depth", "height"), p, True)
                    if item.get("binding") is not None:
                        binding(item["binding"], p + ".binding")
                identity(item, p)
                if item.get("materials") is not None:
                    keys = (
                        ("body", "positiveSide", "negativeSide")
                        if collection == "walls"
                        else ("panel", "frame", "reveal")
                    )
                    obj(item["materials"], keys, (), p)
                    for value in item["materials"].values():
                        material(value, p)
                appearance = item.get("appearance")
                if isinstance(appearance, dict) and collection == "objects":
                    obj(appearance, ("materialSlots",), (), p)
                    if not isinstance(appearance["materialSlots"], dict):
                        fail(p, "Expected material slots.")
                    for key, value in appearance["materialSlots"].items():
                        text(key, p)
                        material(value, p)
                elif appearance is not None:
                    text(appearance, p)
    if scene["defaultFloorId"] not in floor_ids:
        fail("defaultFloorId", "Default floor must exist.")
    return scene

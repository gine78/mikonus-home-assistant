# Mikonus Dashboard for Home Assistant

**Beta — version 0.5.0.**

Mikonus publishes an interactive multi-floor 3D dashboard to Home Assistant.
This integration stores published scenes and connects the Mikonus dashboard
renderer to live Home Assistant entity states and controls.

## Features

- Multi-floor 3D scenes, floor switching, camera rotation and zoom.
- Lights and switches; supported light brightness, color and color temperature.
- Covers, climate, locks and vacuums through supported entity capabilities.
- Motion, occupancy and contact sensor states.
- Live entity updates using the existing Home Assistant frontend connection.
- Authenticated scene publishing, persistent storage and live scene updates.
- Revision conflict detection, retry receipts and reconnect recovery.
- **Mikonus 3D** in the normal Lovelace card picker with a graphical editor.
- Visual scene picker with complete-scene, floor and room views.
- Scene management with revision and last-published information.
- Several cards can use the same scene with independent card-local views.
- Per-card appearance, camera and dashboard-UI settings with live preview.
- Responsive full-width defaults for Sections/Grid dashboards.

Available controls depend on each entity's capabilities and services. Unsupported
capabilities are unavailable. This beta accepts Dashboard Scene schema 2 and
publish contract 1. Custom asset uploads and arbitrary external asset URLs are
not supported. Declared minimum: Home Assistant Core **2026.1.0**. Earlier 2026
releases are allowed for beta testing but have not been locally validated.
Tested with Home Assistant Core **2026.9.0** and a WebGL-capable
Chromium or WebKit browser. Other versions and physical devices have not been fully tested.

## Install with HACS

1. Install and configure [HACS](https://hacs.xyz/docs/use/) if needed.
2. Open HACS, then its menu → **Custom repositories**.
3. Enter `https://github.com/gine78/mikonus-home-assistant` and select
   **Integration** as the type. Add the repository.
4. Find **Mikonus Dashboard** and download it. For the beta release, enable
   **Show beta versions** in its download/redownload dialog if necessary and
   select **v0.5.0**.
5. Restart Home Assistant.
6. Open **Settings → Devices & services → Add integration → Mikonus Dashboard**
   and submit the setup form. No additional account is required by the integration.

This is a HACS custom repository; it is not included in the default HACS list.

## Automatic frontend

The integration bundles, serves and loads the card automatically. Fresh installs
need no `/config/www` copy and no manual Lovelace resource registration.
Mikonus is a normal custom card for Masonry, Sections and card-compatible Panel
layouts; place it in any of your Home Assistant dashboards.

The repository also includes Mikonus brand icons for HACS and Home Assistant's
integration surfaces. Home Assistant Core 2026.3 and newer supports these bundled
local integration images; older supported beta versions may keep showing a generic
integration icon. Home Assistant currently provides no separate logo field for
third-party cards in the card picker, so the card is identified there by its
**Mikonus 3D** name and description.

## Appearance and card editor

The card follows Home Assistant’s active light/dark mode, including changes while
the dashboard is open. The floor-selection header is transparent over the scene;
the floor buttons retain their own backgrounds. Card resizing keeps the viewer
mounted. Add or edit **Mikonus 3D** to configure ambient light, shadows, theme,
automatic brightness, camera lock/rotation/zoom/pan, floor controls, quick
controls and device markers. **Indoor brightness in darkness** keeps the floor
plan readable after sunset while the background remains solar-driven. These
settings apply only to that card instance and
do not modify or duplicate the published Dashboard Scene.

Lamp light cones keep their soft falloff at every shadow strength. The shadow
slider controls general room shadows independently of lamp illumination.
LED strips and LED pendant lights illuminate their full length with a continuous
light band. Pendant bars use a restrained, rounded light falloff. Soft ground
shadows beneath furniture follow the shadow settings.
Lamp and LED illumination stays inside its authored room, including at closed
doors. Asymmetric furniture and appliances follow their canonical orientation.
Daylight, the scene backdrop, sun direction and golden-hour colors follow Home
Assistant's sun position. If those values are unavailable, the canonical
renderer keeps using its local time-based behavior.

## Updating an existing installation

Update to **v0.5.0** in HACS. Restart Home Assistant if the integration requests
it, then fully reload the dashboard page. A custom element already loaded in an
older browser document can remain active, so use a hard reload or open the
dashboard in a new tab after the frontend update. Existing Config Entries,
published scenes, bindings and Lovelace card YAML are retained; no scene
republish or card recreation is required.

Only installations upgraded from 0.2.0 that still have the old manually added
Mikonus Lovelace resource should remove it
(`/local/mikonus-3d-card.js`, including any version suffix) through the Resources
UI or your own YAML. You can then delete `/config/www/mikonus-3d-card.js`.

Both old and new modules can load without a duplicate custom-element error.
The first loaded version remains active for that browser document, so removing
the old resource and refreshing ensures the new recovery behavior is in use.
The integration does not edit user-managed Lovelace resources.

## Publish from Mikonus

In a Mikonus app version that supports the Home Assistant publisher, open
**Settings → Import/Export → Dashboards → Home Assistant**, select your Home
Assistant target and publish your dashboard. Publishing requires Home Assistant
administrator access. Keep access tokens in the publisher's connection settings;
never put them in dashboard YAML or scene data.

The Home Assistant receiving endpoint and dashboard rendering are tested. The
availability of the native publisher depends on your installed Mikonus app
version; this repository does not install or update that app. If the Home
Assistant publisher is absent, an app version with that publisher is required.

The publisher applies the Mikonus entitlement policy; the HA scene store and
card remain multi-scene viewers. Free publishing may keep one active Mikonus
project per HA target: publishing the same project updates its stable scene ID,
while another project requires an explicit Replace/Cancel decision. Replacement
is revision-checked and atomic. Premium may keep several scenes. A later
downgrade never removes existing scenes, and extra cards or floor/room views do
not count as additional published scenes. Manually deleting the only scene
clears its HA record so a later Free publish can start normally.

## Add the Mikonus 3D card (recommended)

After publishing a scene, edit the intended Home Assistant dashboard, choose
**Add card**, search for **Mikonus 3D**, select it and use the graphical editor.
When exactly one scene is available, the editor selects it automatically. With
multiple scenes, choose the intended published scene by name. Then choose the
complete scene, a named floor, or a named room. Save the card; normal setup does
not require YAML or knowledge of technical IDs.

One published scene can back several independent cards—for example the complete
home, the upper floor, the living room and the kitchen. Each card stores only its
own view choice. The full published scene and other cards remain unchanged.

The editor's **Manage published scenes** section lists name, revision and last
publication time. An HA administrator can delete one selected HA copy after an
explicit confirmation. This does not delete the Mikonus project, devices,
entities or another published scene.

Published scene changes appear live. If no scene has been published, publish one
before expecting the 3D dashboard to appear. Removing the integration deletes its
stored scenes; reloading it preserves them.

If a Free replacement or manual deletion removes the scene selected by an
existing card, that card stays bound to its saved ID and reports that the scene
is no longer available. The editor refreshes its scene list and offers the
remaining scenes without silently switching the stale card.

## Optional: add the card manually with YAML

Manual YAML remains available for advanced setups and existing cards. In the
dashboard editor choose **Add card → Manual**, then use:

```yaml
type: custom:mikonus-3d-card
scene: published
```

For multiple published scenes, add `scene_id` with the scene ID returned by your
publisher:

```yaml
type: custom:mikonus-3d-card
scene: published
scene_id: mikonus:your-scene-id
```

Optional fixed views use stable IDs in YAML:

```yaml
# One floor
type: custom:mikonus-3d-card
scene: published
scene_id: mikonus:your-scene-id
view_mode: floor
floor_id: floor-upper

# One room
type: custom:mikonus-3d-card
scene: published
scene_id: mikonus:your-scene-id
view_mode: room
floor_id: floor-ground
room_id: room-living
```

This manual-card option still uses the frontend module loaded by the integration.
Do not add a separate `/local/mikonus-3d-card.js` Lovelace resource.

## Known beta limitation — restart and wall displays

In rare cases, when a dashboard reconnects extremely early during a Home
Assistant restart, the Mikonus custom element may not be loaded by the current
browser session. **Refresh the dashboard once after Home Assistant has finished
starting.** This also applies to continuously open tablet and wall displays.
Kiosk or wall-display setups that already reload after an HA restart also avoid
this edge case; no particular third-party solution is required.

Once the card module has loaded, temporary integration/startup/WebSocket failures
recover automatically. The editor keeps its last successful scene list, retries
after reconnect or on request and does not call a scene deleted until a successful
listing confirms that it is absent. The last working scene stays visible during
a temporary interruption; an authoritatively deleted scene is shown as unavailable.

## Troubleshooting and feedback

- **Custom element does not exist:** wait until Home Assistant has finished
  starting, then refresh the dashboard once.
- **Blank or unavailable renderer:** use a browser with working WebGL support.
- **No scene:** publish a scene from Mikonus first.
- **Several scenes:** select the intended scene by name in the graphical editor,
  or set `scene_id` in advanced YAML.
- **Deleted scene:** edit the affected card and select another published scene;
  Mikonus never switches a stale card silently.
- **Control unavailable:** verify that the entity is available and supports the
  requested action in Home Assistant.

Report beta issues through [GitHub Issues](https://github.com/gine78/mikonus-home-assistant/issues).
Include the integration and Home Assistant versions and reproduction steps.
Remove tokens, private scene data and identifying device details from reports.

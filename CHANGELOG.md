# Changelog

## 0.5.0 Beta

- Select published scenes by name in the visual card editor; manual `scene_id`
  entry remains available for existing and advanced YAML configurations.
- Show a complete scene, a fixed floor or a single room, with independent view
  choices for multiple cards backed by the same published scene.
- Manage published scenes with revision and last-published information and delete
  only the selected Home Assistant copy after explicit confirmation.
- Improve multi-scene publishing, revision-safe deletion, atomic replacement and
  explicit stale-scene handling without silently retargeting existing cards.
- Keep the last successful scene catalog and last working rendering during
  temporary connection failures, with explicit retry and reconnect recovery.
- Preserve `custom:mikonus-3d-card`, optional `scene_id` and Dashboard Scene v1/v2
  compatibility; `view_mode`, `floor_id` and `room_id` remain optional.

Update to **v0.5.0** in HACS and restart Home Assistant. Enable **Show beta
versions** if the update is not listed. Existing Config Entries, scenes,
bindings and card YAML are retained; no scene republish or card recreation is
required. Fully reload the dashboard after the update; if the previous custom
element remains loaded, use a hard reload or open the dashboard in a new tab.

## 0.4.0 Beta

- Add a visual Scene Picker to the card editor; normal setup no longer requires
  a manually entered Scene ID.
- Add complete-scene, Floor and Room views with camera fitting and room filtering.
- Keep view selection local to each card, including multiple cards backed by the
  same published scene.
- Add Scene Management with revision and last-published information and confirmed
  deletion of only the selected Mikonus scene.
- Improve multi-scene behavior, stale-scene handling and safe atomic replacement.
- Preserve existing `custom:mikonus-3d-card` and optional `scene_id` YAML; all new
  view fields are optional.

Update to **v0.4.0** in HACS, restart Home Assistant and hard-refresh the
dashboard once. Existing Config Entries, scenes, bindings and card YAML remain
compatible; no scene republish or card recreation is required.

## 0.3.6 Beta

- Keep the floor plan readable after sunset with a shared **Indoor brightness in
  darkness** setting while the scene background continues to follow solar
  darkness.
- Soften and reduce the continuous light wash from LED pendant bars, including
  rounded falloff without separate spot lights.
- Preserve solar direction, shadows, local lamp states and render-on-demand.

Update to **v0.3.6** in HACS, restart Home Assistant and hard-refresh the
dashboard once. Existing scenes and bindings remain unchanged. The new indoor
brightness setting is enabled by default and can be changed per card in the
graphical editor.

## 0.3.5 Beta

- Add local Mikonus brand icons in standard and dark variants for HACS and
  supported Home Assistant integration surfaces.
- Make the selectable **Mikonus 3D** card and its graphical editor the primary
  dashboard setup path in the public instructions.
- Keep manual YAML card creation as an optional advanced/legacy path; manual
  frontend resource registration remains unnecessary.

Update to **v0.3.5** in HACS and restart Home Assistant. Existing scenes,
bindings, card settings and renderer behavior are unchanged. Home Assistant Core
2026.3 and newer can use the bundled local integration branding; older supported
beta versions may continue to show their generic integration icon.

## 0.3.4 Beta

- Tageshelligkeit, Szenenhintergrund, Sonnenrichtung und Farben der goldenen
  Stunde folgen jetzt den Home-Assistant-Sonnendaten.
- Bei fehlenden oder ungültigen Sonnenwerten bleibt die lokale Zeitsteuerung des
  gemeinsamen Renderers aktiv.
- Die laufende Ansicht übernimmt Änderungen des Sonnenstands ohne einen zweiten
  Renderer oder einen Neuaufbau der Szene.

Update auf **v0.3.4** in HACS, Home Assistant neu starten und das Dashboard einmal
hart aktualisieren. Falls das Update nicht angezeigt wird, **Beta-Versionen
anzeigen** aktivieren. Vorhandene Szenen, Bindings und Karteneinstellungen bleiben
erhalten; ein erneutes Veröffentlichen der Szene ist nicht erforderlich.

## 0.3.3 Beta

- Keep local lamp and LED illumination inside the authored room, so light no
  longer crosses walls and closed doors block it.
- Preserve continuous LED illumination on furniture and decor in the same room
  while excluding adjacent rooms.
- Correct the orientation of asymmetric furniture and appliances to match the
  canonical Mikonus geometry.
- Preserve soft lamp cones, furniture ground shadows and render-on-demand.

Update to **v0.3.3** in HACS, restart Home Assistant and hard-refresh the dashboard
once. Enable **Show beta versions** if the update is not listed. Existing scenes,
bindings and card settings are retained; no scene republish or card recreation is
required.

## 0.3.2 Beta

- Illuminate LED strips and LED pendant lights with a continuous light band across
  their full length, including brightness, color and live on/off controls.
- Add soft ground shadows beneath static furniture, controlled by the existing
  shadow visibility and strength settings.
- Keep lamp illumination independent of room shadow strength and preserve the
  existing render-on-demand behavior.

Update to **v0.3.2** in HACS, restart Home Assistant and hard-refresh the dashboard
once. Enable **Show beta versions** if the update is not listed. Existing scenes,
bindings and card settings are retained; no scene republish or card recreation is
required.

## 0.3.1 Beta

- Keep lamp light cones soft at every shadow strength, including 100%.
- Apply the shadow-strength setting to general room shadows independently of
  lamp illumination. Lamp cones use the same unshadowed falloff as the previous
  0% setting, without hard silhouettes from furniture or the lamp itself.
- Preserve lamp color, brightness and live controls when changing shadow settings.

Update to 0.3.1 in HACS, restart Home Assistant and hard-refresh the dashboard
once. Existing scenes, bindings and card settings are retained; no scene republish
or card recreation is required.

## 0.3.0 Beta

- Register **Mikonus 3D** as a selectable Lovelace card with a graphical,
  English/German `ha-form` editor.
- Add per-card appearance, camera and dashboard-UI settings without adding them
  to Dashboard Scene v2 or duplicating a scene.
- Apply presentation-only edits live to the existing viewer. Ambient light,
  shadows, camera controls, floor selector, quick controls and device markers no
  longer require a scene reload or mesh rebuild.
- Add modern Sections/Grid defaults (`full` width, seven preferred rows, six
  minimum columns/rows) while retaining the canonical renderer's existing
  `ResizeObserver`, camera fit and render-on-demand lifecycle.
- Preserve every previous default when the new fields are absent. Existing
  published and `scene: reference` card configurations remain valid.

Update to 0.3.0 in HACS, restart Home Assistant and hard-refresh the dashboard
once so the browser loads the new frontend bundle. The existing Config Entry,
published scenes, bindings and Lovelace card YAML remain unchanged; no scene
republish or card recreation is required.

## 0.2.3 Beta

- Follow the active Home Assistant light/dark mode, including live theme changes, readable summary text and matching shared renderer controls.
- Fix a clipped 3D scene and blank space below it in cards whose height is calculated automatically by the dashboard layout.
- Make the full-width floor-selection header transparent over the scene while preserving the floor buttons and their backgrounds.
- The embedded viewer now fills the available card height and follows card resizing without recreating the renderer.

Update to 0.2.3 in HACS, restart Home Assistant and refresh the dashboard once.
No scene republish or card configuration change is required.

Declared Home Assistant Core minimum remains 2026.1.0. The existing runtime
acceptance baseline is Core 2026.9.0; earlier 2026 releases remain open to beta
feedback. The known extreme early-restart limitation and refresh workaround remain.

## 0.2.2 Beta

- Lower the declared Home Assistant Core minimum to **2026.1.0**, allowing earlier 2026 installations to try the beta.
- Product behavior is unchanged from 0.2.1.
- Full runtime acceptance remains on **Core 2026.9.0**; earlier 2026 releases have not been locally validated. Please report compatibility issues with your Core and frontend versions.

The known early-restart limitation remains: refresh the dashboard once after Home Assistant has finished starting if the custom card has not loaded.

## 0.2.1 Beta

- Frontend card is now bundled and loaded automatically with the integration.
- Manual `/www` copying is no longer required.
- Manual Lovelace resource registration is no longer required.
- Scene loading now recovers automatically from temporary Home Assistant startup and reconnect conditions.
- Improved integration/card lifecycle resilience; the last working scene stays visible during temporary failures.

### Known beta limitation

In rare cases, when a dashboard reconnects extremely early during a Home Assistant
restart, the Mikonus custom element may not be loaded by the current browser session.
Refreshing the dashboard after Home Assistant has finished starting resolves the issue.

### Updating from 0.2.0

After updating, remove the old manually registered Mikonus Lovelace resource.
The old `/config/www/mikonus-3d-card.js` file can then be deleted. Refresh the
browser to use the new bundle. User-managed resources are not changed automatically.

## 0.2.0 — Initial public beta

- Home Assistant custom integration with configuration through Devices & services.
- Authenticated Mikonus Dashboard Scene publishing.
- Persistent scene storage with revision checks and retry receipts.
- Interactive multi-floor 3D dashboard using the Mikonus dashboard renderer.
- Live Home Assistant entity states and supported device controls.
- Scene update notifications and reconnect recovery.
- English and German integration translations.

This is a beta release. The frontend module requires a manual copy to the Home
Assistant `www` directory and a one-time dashboard resource registration.

# Changelog

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

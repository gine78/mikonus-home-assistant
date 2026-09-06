# Changelog

## 0.2.3 Beta

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

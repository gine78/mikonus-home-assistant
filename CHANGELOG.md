# Changelog

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

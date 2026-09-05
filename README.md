# Mikonus Dashboard for Home Assistant

**Beta — version 0.2.0.**

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

Available controls depend on each entity's capabilities and services. Unsupported
capabilities are unavailable. This beta accepts Dashboard Scene schema 2 and
publish contract 1. Custom asset uploads and arbitrary external asset URLs are
not supported. Tested with Home Assistant Core **2026.9.0** and a WebGL-capable
Chromium browser. Other versions and physical devices have not been fully tested.

## Install with HACS

1. Install and configure [HACS](https://hacs.xyz/docs/use/) if needed.
2. Open HACS, then its menu → **Custom repositories**.
3. Enter `https://github.com/gine78/mikonus-home-assistant` and select
   **Integration** as the type. Add the repository.
4. Find **Mikonus Dashboard** and download it. For the beta release, enable
   **Show beta versions** in its download/redownload dialog if necessary and
   select **v0.2.0**.
5. Restart Home Assistant.
6. Open **Settings → Devices & services → Add integration → Mikonus Dashboard**
   and submit the setup form. No additional account is required by the integration.

This is a HACS custom repository; it is not included in the default HACS list.

## Register the dashboard module

Version 0.2.0 packages the frontend inside the integration but does not serve or
register it automatically. Using your Home Assistant file editor or file access:

1. Create the `www` directory inside your Home Assistant configuration directory
   if it does not exist.
2. Copy `custom_components/mikonus_dashboard/frontend/mikonus-3d-card.js` to
   `www/mikonus-3d-card.js` inside that same configuration directory.
3. If you just created `www`, restart Home Assistant again.
4. Enable **Advanced mode** in your Home Assistant user profile. Open
   **Settings → Dashboards → menu → Resources → Add resource**.
5. Set the URL to `/local/mikonus-3d-card.js?v=0.2.0` and the resource type to
   **JavaScript Module**. Save, then reload the browser.

For dashboards with YAML-managed resources, use:

```yaml
lovelace:
  resource_mode: yaml
  resources:
    - url: /local/mikonus-3d-card.js?v=0.2.0
      type: module
```

After future HACS updates, repeat the module copy and change the URL version
suffix to the installed version. HACS updates the integration's bundled file;
it does not update your manually copied `www` file.

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

## Add the card

Edit a Home Assistant dashboard, add a **Manual** card and enter:

```yaml
type: custom:mikonus-3d-card
scene: published
```

When exactly one scene is published, it is selected automatically. For multiple
scenes, add `scene_id` with the scene ID returned by your publisher:

```yaml
type: custom:mikonus-3d-card
scene: published
scene_id: mikonus:your-scene-id
```

Published scene changes appear live. If no scene has been published, publish one
before expecting the 3D dashboard to appear. Removing the integration deletes its
stored scenes; reloading it preserves them.

## Troubleshooting and feedback

- **Custom element does not exist:** check the file copy and JavaScript Module
  resource, then reload the browser.
- **Blank or unavailable renderer:** use a browser with working WebGL support.
- **No scene / multiple scenes:** publish a scene or set the intended `scene_id`.
- **Control unavailable:** verify that the entity is available and supports the
  requested action in Home Assistant.

Report beta issues through [GitHub Issues](https://github.com/gine78/mikonus-home-assistant/issues).
Include the integration and Home Assistant versions and reproduction steps.
Remove tokens, private scene data and identifying device details from reports.

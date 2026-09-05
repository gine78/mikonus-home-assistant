"""A local target needs no second connection or credentials."""

import voluptuous as vol
from homeassistant import config_entries

from .const import DOMAIN, NAME


class MikonusDashboardConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        self._async_abort_entries_match()
        if user_input is not None:
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()
            return self.async_create_entry(title=NAME, data={})
        return self.async_show_form(step_id="user", data_schema=vol.Schema({}))

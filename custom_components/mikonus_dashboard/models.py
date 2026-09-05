"""Entry-owned runtime and transport errors."""

from dataclasses import dataclass
from typing import TYPE_CHECKING

from homeassistant.config_entries import ConfigEntry

if TYPE_CHECKING:
    from .storage import SceneStore


class ContractError(Exception):
    def __init__(self, code: str, message: str, status: int = 400, **details):
        super().__init__(message)
        self.code = code
        self.status = status
        self.body = {"code": code, "message": message, **details}


@dataclass
class DashboardRuntime:
    store: "SceneStore"


type MikonusDashboardConfigEntry = ConfigEntry[DashboardRuntime]

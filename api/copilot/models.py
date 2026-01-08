from pydantic import BaseModel


class CopilotEditorModel(BaseModel):
    name: str
    total_engaged_users: int


class CopilotLanguageModel(BaseModel):
    name: str
    total_engaged_users: int


class CopilotModelUsageModel(BaseModel):
    name: str
    is_custom_model: bool
    total_engaged_users: int


class CopilotMetricsModel(BaseModel):
    total_active_users: int
    total_engaged_users: int
    languages: list[CopilotLanguageModel]
    editors: list[CopilotEditorModel]
    models: list[CopilotModelUsageModel]


class CopilotSummaryModel(BaseModel):
    total_seats: int
    seats_assigned: int
    seats_active_this_cycle: int
    seats_inactive_this_cycle: int
    seat_breakdown_by_status: dict[str, int]


class CopilotResponseModel(BaseModel):
    summary: CopilotSummaryModel | None
    metrics: CopilotMetricsModel | None

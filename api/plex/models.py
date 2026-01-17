from pydantic import BaseModel


class PlexHealthResponse(BaseModel):
    """Response model for Plex server health check."""

    friendly_name: str
    version: str
    platform: str
    platform_version: str
    claimed: bool
    machine_identifier: str


class PlexPlayer(BaseModel):
    """Model for the player/device playing media."""

    title: str
    platform: str
    product: str
    state: str  # playing, paused, buffering


class PlexSession(BaseModel):
    """Model for an active Plex session."""

    username: str
    title: str
    media_type: str  # movie, episode, track
    grandparent_title: str | None = None  # Show name for episodes
    parent_title: str | None = None  # Season name for episodes
    year: int | None = None
    thumb: str | None = None
    player: PlexPlayer
    progress_percent: float
    duration_ms: int
    view_offset_ms: int


class PlexSessionsResponse(BaseModel):
    """Response model for active Plex sessions."""

    count: int
    sessions: list[PlexSession]


class PlexLibrarySection(BaseModel):
    """Model for a Plex library section."""

    key: str
    title: str
    type: str  # movie, show, artist, photo
    count: int


class PlexLibraryCountsResponse(BaseModel):
    """Response model for library counts."""

    total_items: int
    sections: list[PlexLibrarySection]

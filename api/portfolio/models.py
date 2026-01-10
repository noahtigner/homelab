from pydantic import BaseModel


class OGPHybridGraph(BaseModel):
    image: str
    title: str
    description: str


class OGPPreviewResponse(BaseModel):
    hybridGraph: OGPHybridGraph

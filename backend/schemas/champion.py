from pydantic import BaseModel, ConfigDict


class ChampionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    title: str
    role: str
    region: str
    image_key: str

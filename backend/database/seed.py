from sqlalchemy import select
from sqlalchemy.orm import Session

from models.champion import Champion

# (nombre, título, rol, región, clave de imagen en Data Dragon)
CAMPEONES = [
    ("Aatrox", "La Espada Darkin", "Top", "Shurima", "Aatrox"),
    ("Camille", "La Sombra de Acero", "Top", "Piltover", "Camille"),
    ("Darius", "La Mano de Noxus", "Top", "Noxus", "Darius"),
    ("Fiora", "La Gran Duelista", "Top", "Demacia", "Fiora"),
    ("Garen", "El Poder de Demacia", "Top", "Demacia", "Garen"),
    ("Gnar", "El Eslabón Perdido", "Top", "Freljord", "Gnar"),
    ("Jax", "Gran Maestro de Armas", "Top", "Targon", "Jax"),
    ("Malphite", "Fragmento del Monolito", "Top", "Ixtal", "Malphite"),
    ("Ornn", "El Fuego bajo la Montaña", "Top", "Freljord", "Ornn"),
    ("Sett", "El Jefe", "Top", "Jonia", "Sett"),
    ("Amumu", "La Momia Triste", "Jungla", "Shurima", "Amumu"),
    ("Elise", "La Reina Araña", "Jungla", "Islas de la Sombra", "Elise"),
    ("Graves", "El Proscrito", "Jungla", "Aguas Estancadas", "Graves"),
    ("Kha'Zix", "El Acechador del Vacío", "Jungla", "Vacío", "Khazix"),
    ("Lee Sin", "El Monje Ciego", "Jungla", "Jonia", "LeeSin"),
    ("Master Yi", "El Espadachín Wuju", "Jungla", "Jonia", "MasterYi"),
    ("Nidalee", "La Cazadora Bestial", "Jungla", "Ixtal", "Nidalee"),
    ("Vi", "La Agente de Piltover", "Jungla", "Piltover", "Vi"),
    ("Viego", "El Rey Arruinado", "Jungla", "Islas de la Sombra", "Viego"),
    ("Warwick", "La Furia de Zaun", "Jungla", "Zaun", "Warwick"),
    ("Ahri", "La Vastaya de Nueve Colas", "Mid", "Jonia", "Ahri"),
    ("Akali", "La Asesina Rebelde", "Mid", "Jonia", "Akali"),
    ("Orianna", "La Dama Mecánica", "Mid", "Piltover", "Orianna"),
    ("Sylas", "El Rompecadenas", "Mid", "Demacia", "Sylas"),
    ("Syndra", "La Soberana Oscura", "Mid", "Jonia", "Syndra"),
    ("Veigar", "El Pequeño Maestro del Mal", "Mid", "Bandle City", "Veigar"),
    ("Yasuo", "El Imperdonable", "Mid", "Jonia", "Yasuo"),
    ("Zed", "El Maestro de las Sombras", "Mid", "Jonia", "Zed"),
    ("Viktor", "El Heraldo de las Máquinas", "Mid", "Zaun", "Viktor"),
    ("Ziggs", "El Experto en Hexplosivos", "Mid", "Zaun", "Ziggs"),
    ("Ashe", "La Arquera de Hielo", "ADC", "Freljord", "Ashe"),
    ("Caitlyn", "La Sheriff de Piltover", "ADC", "Piltover", "Caitlyn"),
    ("Ezreal", "El Explorador Pródigo", "ADC", "Piltover", "Ezreal"),
    ("Jhin", "El Virtuoso", "ADC", "Jonia", "Jhin"),
    ("Jinx", "El Gatillo Suelto", "ADC", "Zaun", "Jinx"),
    ("Kai'Sa", "Hija del Vacío", "ADC", "Vacío", "Kaisa"),
    ("Miss Fortune", "La Cazarrecompensas", "ADC", "Aguas Estancadas", "MissFortune"),
    ("Tristana", "La Artillera Yordle", "ADC", "Bandle City", "Tristana"),
    ("Vayne", "La Cazadora Nocturna", "ADC", "Demacia", "Vayne"),
    ("Xayah", "La Rebelde", "ADC", "Ixtal", "Xayah"),
    ("Alistar", "El Minotauro", "Soporte", "Noxus", "Alistar"),
    ("Blitzcrank", "El Gran Golem de Vapor", "Soporte", "Zaun", "Blitzcrank"),
    ("Janna", "La Furia de la Tormenta", "Soporte", "Zaun", "Janna"),
    ("Lulu", "La Hechicera Hada", "Soporte", "Bandle City", "Lulu"),
    ("Lux", "La Dama Luminosa", "Soporte", "Demacia", "Lux"),
    ("Morgana", "La Caída", "Soporte", "Demacia", "Morgana"),
    ("Nami", "La Invocamareas", "Soporte", "Aguas Estancadas", "Nami"),
    ("Nautilus", "El Titán de las Profundidades", "Soporte", "Aguas Estancadas", "Nautilus"),
    ("Soraka", "La Hija de las Estrellas", "Soporte", "Targon", "Soraka"),
    ("Thresh", "El Guardián de las Cadenas", "Soporte", "Islas de la Sombra", "Thresh"),
]


def cargar_campeones(db: Session) -> None:
    """Inserta los campeones que falten; se puede llamar en cada arranque."""
    existentes = set(db.scalars(select(Champion.name)).all())
    nuevos = [
        Champion(name=n, title=t, role=r, region=reg, image_key=k)
        for n, t, r, reg, k in CAMPEONES
        if n not in existentes
    ]
    if nuevos:
        db.add_all(nuevos)
        db.commit()

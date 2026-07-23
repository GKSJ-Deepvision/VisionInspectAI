from anomalib.engine import Engine
import data.config as config
from data.datamodule import get_datamodule
from models.patchcore import get_model
def train():
    datamodule = get_datamodule()
    model = get_model()
    engine = Engine(
        max_epochs=config.MAX_EPOCHS,
        default_root_dir=config.OUTPUT_ROOT,
    )
    engine.fit(
        model=model,
        datamodule=datamodule,
    )
if __name__ == "__main__":
    train()
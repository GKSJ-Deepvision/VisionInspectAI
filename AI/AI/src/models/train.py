from anomalib.engine import Engine

import data.config as config
from data.datamodule import get_datamodule
from models.patchcore import get_model


def train():
    print("Training PatchCore Models")
    print(config.LINE)

    for category in config.CATEGORIES:

        print(config.LINE)
        print(f"Training Category : {category}")
        print(config.LINE)

        checkpoint = config.get_checkpoint_path(category)

        if checkpoint.exists():
            print(f" {category} already trained. Skipping...\n")
            continue

        try:
            datamodule = get_datamodule(category)

            model = get_model()

            engine = Engine(
                max_epochs=config.MAX_EPOCHS,
                default_root_dir=config.OUTPUT_ROOT,
            )

            engine.fit(
                model=model,
                datamodule=datamodule,
            )

            print(f" {category} training completed.\n")

        except Exception as e:
            print(f" Error while training {category}")
            print(e)

    print("\nAll categories processed.")
    print(config.LINE)


if __name__ == "__main__":
    train()
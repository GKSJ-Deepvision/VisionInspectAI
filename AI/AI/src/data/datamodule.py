from anomalib.data import MVTecAD
import data.config as config


def get_datamodule(category: str):

    datamodule = MVTecAD(
        root=config.PROCESSED_DATASET_ROOT,
        category=category,
        train_batch_size=config.TRAIN_BATCH_SIZE,
        eval_batch_size=config.EVAL_BATCH_SIZE,
        num_workers=config.NUM_WORKERS,
    )

    return datamodule
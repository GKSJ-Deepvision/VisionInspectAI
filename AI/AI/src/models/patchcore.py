from anomalib.models import Patchcore
import data.config as config
def get_model():
    model = Patchcore(
        backbone=config.BACKBONE,
        layers=config.FEATURE_LAYERS,
        pre_trained=config.PRETRAINED,
        coreset_sampling_ratio=config.CORESET_SAMPLING_RATIO,
        num_neighbors=config.NUM_NEIGHBORS,
        #PatchCore handle preprocessing
        pre_processor=True,
        #post-processing (thresholding)
        post_processor=True,
        #evaluation
        evaluator=True,
        #visualization
        visualizer=True,
    )
    return model
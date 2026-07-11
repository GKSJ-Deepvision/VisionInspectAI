import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
# Dataset paths

train_dir = "../dataset_split/train"
validation_dir = "../dataset_split/validation"
test_dir = "../dataset_split/test"
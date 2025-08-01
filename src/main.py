import os
import sys
sys.path.append(os.path.dirname(__file__))

from model_training.dataset_operations import DatasetOperations

from model_training.nlp_operations import NLPOperations
from zemberek import (
    TurkishSentenceExtractor,
    TurkishMorphology,
)
sentenceExtractor = TurkishSentenceExtractor()
morphology = TurkishMorphology.create_with_defaults()

from model_training.multinomialnb_operations import MultinomialNBOperations
from model_training.linearsvc_operations import LinearSVCOperations

if __name__ == "__main__":
    nlpOperations = NLPOperations(sentenceExtractor, morphology)

    datasetOperations = DatasetOperations(nlpOperations)    
    datasetOperations.convert()

    multinomialNBTrainer = MultinomialNBOperations(datasetOperations, nlpOperations)
    linearSVCTrainer = LinearSVCOperations(datasetOperations, nlpOperations)

    multinomialNBTrainer.trainModel()
    linearSVCTrainer.trainModel()
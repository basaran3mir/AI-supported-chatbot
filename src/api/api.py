import os
import sys
sys.path.append(os.path.dirname(__file__))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import time
from flask import Flask, request, jsonify
from flask_cors import CORS

from model_training.nlp_operations import NLPOperations
from model_training.dataset_operations import DatasetOperations
from model_training.multinomialnb_operations import MultinomialNBOperations
from model_training.linearsvc_operations import LinearSVCOperations

from zemberek import (
    TurkishSentenceExtractor,
    TurkishMorphology,
)
sentenceExtractor = TurkishSentenceExtractor()
morphology = TurkishMorphology.create_with_defaults()
nlpOperations = NLPOperations(sentenceExtractor, morphology)
datasetOperations = DatasetOperations(nlpOperations)  
multinomialNB_ModelProcessor = MultinomialNBOperations(datasetOperations, nlpOperations)
linearSVC_ModelProcessor = LinearSVCOperations(datasetOperations, nlpOperations)

app = Flask(__name__)
CORS(app)

@app.before_request
def before_request_func():
    global start_time
    start_time = time.time()

@app.route('/')
def home():
    return "Be-Bot API Home Page"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    question = data.get('question', '')
    model_type = data.get('model_type', '')

    tags = []
    probabilities = []
    responses = []

    if model_type == "MultinomialNB":
        acceptable_prob = 0.7000
        min_acceptable_prob = 0.0100
        responseObjects = multinomialNB_ModelProcessor.predict(question)
    elif model_type == "LinearSVC":
        acceptable_prob = 0.7500
        min_acceptable_prob = -0.7000
        responseObjects = linearSVC_ModelProcessor.predict(question)
    else:
        return_code = 'error'
        return jsonify({'return_code': return_code, 'error_code': 'Invalid model type'}), 500
     
    end_time = time.time()
    duration = round(end_time - start_time, 4)

    if responseObjects:
        for responseObject in responseObjects:
            tags.append(responseObject.tag)
            probabilities.append(float(responseObject.probability))
            responses.append(responseObject.response)

    if probabilities:
        if probabilities[0] >= acceptable_prob:
            return_code = "predict-is-acceptable"
        elif min_acceptable_prob < probabilities[0] < acceptable_prob:
            return_code = 'predict-is-between-min-and-max-prob'
        elif probabilities[0] <= min_acceptable_prob:
            return_code = 'predict-is-below-min-prob'
        return jsonify({'return_code': return_code, 'question': question, 'tag': tags, 'probability': probabilities, 'response': responses, 'model_type': model_type, 'duration': duration})
    else:
        return_code = 'error'
        return jsonify({'return_code': return_code, 'error_code': 'Unknown error'}), 500

if __name__ == '__main__':
    app.run()

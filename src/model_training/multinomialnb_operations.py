import os
import sys
sys.path.append(os.path.dirname(__file__))

import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score
import joblib
from model_training.response_object import ResponseObject

class MultinomialNBOperations:
    
    def __init__(self, datasetOperations, nlpOperations):
        self.static_json_dataset = datasetOperations.static_dataset_json_path
        self.json_dataset = datasetOperations.dataset_json_path
        self.model_dataset = datasetOperations.dataset_shuffled_nlp_applied_csv_path
        self.nlpOperations = nlpOperations

        self.model_file = 'src/model_training/outputs/models/MultinomialNB/my_model.joblib'
        self.model = self.checkModel()

    def trainModel(self):
        df = pd.read_csv(self.model_dataset)

        texts = df['pattern'].values
        labels = df['tag'].values

        texts_train, texts_test, labels_train, labels_test = train_test_split(texts, labels, test_size=0.23, random_state=42)

        model = make_pipeline(CountVectorizer(), MultinomialNB())
        model.fit(texts_train, labels_train)

        predictions = model.predict(texts_test)
        accuracy = accuracy_score(labels_test, predictions)

        self.saveModel(model, self.model_file)

        return model

    def saveModel(self, model, model_file):
        joblib.dump(model, model_file)
        
    def loadModel(self, model_file):
        if os.path.exists(model_file):
            loaded_model = joblib.load(model_file)
            return loaded_model
        else:
            return False

    def checkModel(self):
        if(self.loadModel(self.model_file) == False):
            return self.trainModel()
        return self.loadModel(self.model_file)

    def find_tag_in_dataset(self, text):
        try:
            with open(self.json_dataset, 'r', encoding='utf-8') as file:
                data = json.load(file)

            with open(self.static_json_dataset, 'r', encoding='utf-8') as extra_file:
                extra_data = json.load(extra_file)

            combined_intents = data.get('intents', []) + extra_data.get('intents', [])

        except (FileNotFoundError, json.JSONDecodeError):
            return None

        for intent in combined_intents:
            if intent.get('tag', '').strip().lower() == text.strip().lower():
                return [ResponseObject(intent.get('tag', ''), "1.0000", intent.get('response', None))]

        return None
                
    def find_tag_in_model(self, text):
        final_text = self.nlpOperations.do_all(text)
        predicted_probabilities = self.model.predict_proba([final_text])[0]

        sorted_indices = predicted_probabilities.argsort()[::-1]
        sorted_tags = self.model.classes_[sorted_indices]
        sorted_probabilities = predicted_probabilities[sorted_indices]
        sorted_responses = self.getResponseFromTags(sorted_tags[:5])

        json_data = []
        for tag, prob, response in zip(sorted_tags, sorted_probabilities, sorted_responses):
            json_data.append({
                "tag": tag,
                "probability": round(prob, 4),
                "response": response
            })

        responseObjects = []
        for item in json_data:
            responseObject = ResponseObject(item['tag'], item['probability'], item['response'])
            responseObjects.append(responseObject)

        return responseObjects

    def getResponseFromTags(self, sorted_tags):
        sorted_responses = []
        responses = {}  
        try:
            with open(self.json_dataset, 'r', encoding='utf-8') as file:
                data = json.load(file)
        except FileNotFoundError:
            return None
        except json.JSONDecodeError:
            return None
    
        for intent in data.get('intents', []):
            tag = intent.get('tag','')
            response = intent.get('response', None)
            responses[tag] = response

        for tag in sorted_tags[:5]:
            if tag in responses:
                response = responses[tag]
                sorted_responses.append(response)
    
        return sorted_responses

    def predict(self, text):
        responseObjects = self.find_tag_in_dataset(text)
        if responseObjects is not None:
            return responseObjects
        else: 
            responseObjects = self.find_tag_in_model(text)
            return responseObjects
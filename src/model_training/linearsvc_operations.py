import os
import sys
sys.path.append(os.path.dirname(__file__))

import json
import os
import pandas as pd
from sklearn.calibration import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.metrics import accuracy_score
import joblib
from model_training.response_object import ResponseObject

class LinearSVCOperations:
    
    def __init__(self, datasetOperations, nlpOperations):
        self.static_json_dataset = datasetOperations.static_dataset_json_path
        self.json_dataset = datasetOperations.dataset_json_path
        self.model_dataset = datasetOperations.dataset_shuffled_nlp_applied_csv_path
        self.nlpOperations = nlpOperations

        self.model_file = 'src/model_training/outputs/models/LinearSVC/linear_svc_model.pkl'
        self.count_vect_file = 'src/model_training/outputs/models/LinearSVC/count_vect.pkl'
        self.transformer_file = 'src/model_training/outputs/models/LinearSVC/transformer.pkl'

        self.model = self.checkModel()

    def trainModel(self):
        df=pd.read_csv(self.model_dataset, engine='python', encoding='UTF-8')

        x_train, x_test, y_train, y_test = train_test_split(df["pattern"],df["tag"], test_size = 0.22, random_state = 42)    
        count_vect = CountVectorizer(ngram_range=(1, 2))        
        transformer = TfidfTransformer(norm='l2',sublinear_tf=True)

        x_train_counts = count_vect.fit_transform(x_train)
        x_train_tfidf = transformer.fit_transform(x_train_counts)
        x_test_counts = count_vect.transform(x_test)
        x_test_tfidf = transformer.transform(x_test_counts)

        joblib.dump(count_vect, self.count_vect_file)
        joblib.dump(transformer, self.transformer_file)

        model = LinearSVC()
        model.fit(x_train_tfidf, y_train)
        y_pred2 = model.predict(x_test_tfidf)
        print("Model training is done.")
        print(f"Model accuracy: {accuracy_score(y_test,y_pred2) * 100:.2f}%")

        self.saveModel(model, self.model_file)
        return model

    def saveModel(self, model, model_file):
        joblib.dump(model, model_file)
        
    def loadModel(self, model_file):
        print("Model is loading:", model_file)
        if os.path.exists(model_file):
            loaded_model = joblib.load(model_file)
            print("Model loaded.")
            return loaded_model
        else:
            print("Model not found.")
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
        count_vect = joblib.load(self.count_vect_file)
        transformer = joblib.load(self.transformer_file)

        final_text = self.nlpOperations.do_all(text)

        mc = count_vect.transform([final_text])
        m = transformer.transform(mc)

        decision_function = self.model.decision_function(m)

        top_classes = sorted(range(len(decision_function[0])), key=lambda i: decision_function[0][i], reverse=True)[:5]

        json_data = []
        for i, class_index in enumerate(top_classes):
            class_label = self.model.classes_[class_index]
            probability = decision_function[0][class_index]
            response = self.getResponseFromTag(class_label)
            json_data.append({
                "tag": class_label,
                "probability": round(probability, 4),
                "response": response
            })
        responseObjects = []
        for item in json_data:
            responseObject = ResponseObject(item['tag'], item['probability'], item['response'])
            responseObjects.append(responseObject)

        return responseObjects

    def getResponseFromTag(self, tag):
        responses = {}
        try:
            with open(self.json_dataset, 'r', encoding='utf-8') as file:
                data = json.load(file)
        except FileNotFoundError:
            return None
        except json.JSONDecodeError:
            return None
        
        for intent in data.get('intents', []):
            intent_tag = intent.get('tag', '')
            response_list = intent.get('response', [])
            if response_list:
                responses[intent_tag] = response_list[0]

        return responses.get(tag, None)

    def predict(self, text):
        responseObjects = self.find_tag_in_dataset(text)
        if responseObjects is not None:
            return responseObjects
        else: 
            responseObjects = self.find_tag_in_model(text)
            return responseObjects
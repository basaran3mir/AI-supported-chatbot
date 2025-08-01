import json
import csv
import numpy as np
import pandas as pd

from model_training.nlp_operations import NLPOperations

class DatasetOperations:
    def __init__(self, nlpOperations):
        self.static_dataset_json_path = "src\model_training\datasets\static_dataset.json"
        self.dataset_json_path = "src\model_training\datasets\dataset.json"
        self.dataset_csv_path = "src\model_training\datasets\dataset.csv"
        self.dataset_shuffled_csv_path = "src\model_training\datasets\dataset_shuffled.csv"
        self.dataset_shuffled_nlp_applied_csv_path = "src\model_training\datasets\dataset_shuffled_nlp_applied.csv"
        self.nlpOperations = nlpOperations

    def json_to_csv(self):
        with open(self.dataset_json_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)

        with open(self.dataset_csv_path, 'w', newline='', encoding='utf-8') as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(['tag', 'pattern', 'response'])

            for intent in data['intents']:
                tag = intent['tag']
                response = intent['response']
                for pattern in intent['patterns']:
                    writer.writerow([tag, pattern, response])

    def shuffle_csv(self):
        df = pd.read_csv(self.dataset_csv_path)
        df_shuffled = df.sample(frac=1, random_state=np.random.RandomState())
        df_shuffled.to_csv(self.dataset_shuffled_csv_path, index=False)

    def apply_nlp_to_csv(self):
        self.nlpOperations.csv_to_nlp(self.dataset_shuffled_csv_path, self.dataset_shuffled_nlp_applied_csv_path)

    def convert(self):
        self.json_to_csv()
        self.shuffle_csv()
        self.apply_nlp_to_csv()
        print(f"Dataset operations is done successfully: '{self.dataset_shuffled_nlp_applied_csv_path}'")
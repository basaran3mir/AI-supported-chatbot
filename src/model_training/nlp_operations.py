import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

import pandas as pd
from typing import List
import pandas as pd

from zemberek import (
    TurkishSentenceExtractor,
    TurkishMorphology,
)

class NLPOperations:
    def __init__(self, sentenceExtractor, morphology):
        if sentenceExtractor is None:
            sentenceExtractor = TurkishSentenceExtractor()
        if morphology is None:
            morphology = TurkishMorphology.create_with_defaults()

        self.stop_words = set(self.get_turkish_stopwords("src/model_training/res/turkish_stop_words.txt"))
        self.sentenceExtractor = sentenceExtractor
        self.morphology = morphology

    def do_tokenize_TR(self, text):
        sentences = self.sentenceExtractor.from_paragraph(text)
        return sentences

    def get_turkish_stopwords(self, file_path):
        turkish_stop_words = []
        with open(file_path, 'r', encoding='utf-8') as dosya:
            content = dosya.read()
            turkish_stop_words = content.split()
        return turkish_stop_words

    def do_stopwords_TR(self, sentence):
        words = sentence.split() if isinstance(sentence, str) else sentence
        words = [word.lower() for word in words]
        filtered_sentence = ' '.join([word for word in words if word.lower() not in self.stop_words])
        return filtered_sentence
    
    def do_stemm_TR(self,sentence):
        analysis = self.morphology.analyze_sentence(sentence)
        after = self.morphology.disambiguate(sentence, analysis)
        results: List[str] = []
        for s in after.best_analysis():
            results.append(s.format_string())
        
        words = []
        for result in results:

            parts = result.split(' ')
            word_with_tag = parts[0]

            tag = word_with_tag.split(':')[1]
            tag = tag.replace('[', '').replace(']', '').replace(',', '')
            if(tag == ''):
                tag = word_with_tag.split(':')[2]
                tag = tag.replace('[', '').replace(']', '').replace(',', '')

            if(tag == "Unk"):
                unknown_original = parts[2].split(':')[0]
                if(unknown_original == "'"):
                    continue
                else:
                    words.append(unknown_original)
            elif(tag == "Punc"):
                continue
            else:
                word = word_with_tag.split(':')[0][1:]
                words.append(word)

        words = [word.lower() for word in words]

        return words

    def do_all(self, text):
        print(f"Question: {text}")
        sentences = self.do_tokenize_TR(text)
        processed_sentences = []
    
        for sentence in sentences:
            stopword_removed_words = self.do_stopwords_TR(sentence)
            stemmed_words = self.do_stemm_TR(stopword_removed_words)
            stopword_removed_words = self.do_stopwords_TR(stemmed_words)
            processed_sentences.append(stopword_removed_words)

        final_text = ' '.join(processed_sentences)

        print(f"Processed question: {final_text}")
        return final_text

    def csv_to_nlp(self, input_file, output_file):
        df = pd.read_csv(input_file)
        df['pattern'] = df['pattern'].apply(self.do_all)

        df.to_csv(output_file, index=False)
        df = pd.read_csv(output_file)

        nan_indices = df[df.isnull().any(axis=1)].index
        df.drop(nan_indices, inplace=True)
        df.to_csv(output_file, index=False)

        print(f"New dataset saved to {output_file}.")
import json
import os

CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config', 'dosha_config.json')

def load_config(path=CONFIG_PATH):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

class DoshaScorer:
    def __init__(self, config=None):
        self.config = config or load_config()

    def score_feature(self, value, thresholds, scores):
        """
        thresholds: [low, high], scores: [low_score, mid_score, high_score]
        Возвращает балл в зависимости от попадания value в диапазон.
        """
        if value < thresholds[0]:
            return scores[0]
        elif value < thresholds[1]:
            return scores[1]
        else:
            return scores[2]

    def calculate_dosha_scores(self, params):
        """
        params: dict с ключами hr, hrv, amplitude, morphology
        Возвращает: {'vata': int, 'pitta': int, 'kapha': int}
        """
        result = {}
        for dosha, features in self.config.items():
            score = 0
            for feature in ['hr', 'hrv', 'amplitude', 'morphology']:
                value = params.get(feature)
                if value is None:
                    continue
                conf = features.get(feature)
                if conf:
                    score += self.score_feature(value, conf['thresholds'], conf['scores'])
            result[dosha] = score
        return result

def calculate_dosha_scores(params: dict) -> dict:
    """
    Интерфейс для внешнего использования.
    params: {'hr': float, 'hrv': float, 'amplitude': float, 'morphology': float}
    """
    scorer = DoshaScorer()
    return scorer.calculate_dosha_scores(params)

def calculate_dosha(pulse_data):
    # TODO: Реализовать алгоритм расчёта доши
    return {
        'vata': 0.33,
        'pitta': 0.33,
        'kapha': 0.34
    }

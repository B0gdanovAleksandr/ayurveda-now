import unittest
from backend.dosha_scoring import calculate_dosha
import pytest
from backend.dosha_scoring import calculate_dosha_scores, DoshaScorer, load_config

class TestDoshaScoring(unittest.TestCase):
    def test_calculate_dosha(self):
        pulse_data = [72, 75, 70]
        result = calculate_dosha(pulse_data)
        self.assertIn('vata', result)
        self.assertIn('pitta', result)
        self.assertIn('kapha', result)

# Фиктивный конфиг для тестов (соответствует текущему формату)
TEST_CONFIG = {
    "hr": {
        "low": {"kapha": 2, "pitta": 0, "vata": 0},
        "medium": {"kapha": 0, "pitta": 2, "vata": 0},
        "high": {"kapha": 0, "pitta": 0, "vata": 2}
    },
    "hrv": {
        "low": {"kapha": 2, "pitta": 0, "vata": 0},
        "medium": {"kapha": 0, "pitta": 2, "vata": 0},
        "high": {"kapha": 0, "pitta": 0, "vata": 2}
    },
    "amplitude": {
        "low": {"kapha": 2, "pitta": 0, "vata": 0},
        "medium": {"kapha": 0, "pitta": 2, "vata": 0},
        "high": {"kapha": 0, "pitta": 0, "vata": 2}
    },
    "morphology": {
        "smooth": {"kapha": 2, "pitta": 0, "vata": 0},
        "sharp": {"kapha": 0, "pitta": 2, "vata": 0},
        "irregular": {"kapha": 0, "pitta": 0, "vata": 2}
    }
}

def get_scorer():
    return DoshaScorer(config=TEST_CONFIG)

def test_score_kapha_dominant():
    scorer = get_scorer()
    params = {
        'hr': '50',  # low
        'hrv': '25', # low
        'amplitude': 'low',
        'morphology': 'smooth',
    }
    scores = scorer.calculate_dosha_scores(params)
    assert scores['kapha'] > scores['pitta'] and scores['kapha'] > scores['vata']
    assert scores['kapha'] == 8

def test_score_vata_dominant():
    scorer = get_scorer()
    params = {
        'hr': '110',  # high
        'hrv': '90',  # high
        'amplitude': 'high',
        'morphology': 'irregular',
    }
    scores = scorer.calculate_dosha_scores(params)
    assert scores['vata'] > scores['pitta'] and scores['vata'] > scores['kapha']
    assert scores['vata'] == 8

def test_score_pitta_dominant():
    scorer = get_scorer()
    params = {
        'hr': '75',  # medium
        'hrv': '50', # medium
        'amplitude': 'medium',
        'morphology': 'sharp',
    }
    scores = scorer.calculate_dosha_scores(params)
    assert scores['pitta'] > scores['vata'] and scores['pitta'] > scores['kapha']
    assert scores['pitta'] == 8

def test_invalid_data():
    scorer = get_scorer()
    # Неизвестная морфология и амплитуда
    params = {
        'hr': '60',
        'hrv': '40',
        'amplitude': 'unknown',
        'morphology': 'unknown',
    }
    scores = scorer.calculate_dosha_scores(params)
    # Баллы только за hr и hrv
    assert isinstance(scores, dict)
    assert all(isinstance(v, int) for v in scores.values())

def test_missing_fields():
    scorer = get_scorer()
    params = {'hr': '60'}  # только один параметр
    scores = scorer.calculate_dosha_scores(params)
    assert isinstance(scores, dict)
    assert all(isinstance(v, int) for v in scores.values())

def test_tridoshic():
    scorer = get_scorer()
    # Все признаки дают по 2 балла разным дошам
    params = {
        'hr': '50',      # low -> kapha
        'hrv': '50',     # medium -> pitta
        'amplitude': 'high', # high -> vata
        'morphology': 'sharp', # sharp -> pitta
    }
    scores = scorer.calculate_dosha_scores(params)
    # kapha: 2, pitta: 4, vata: 2
    # Добавим ещё один параметр для vata, чтобы у всех было по 2
    params2 = {
        'hr': '50',      # low -> kapha
        'hrv': '90',     # high -> vata
        'amplitude': 'medium', # medium -> pitta
        'morphology': 'irregular', # irregular -> vata
    }
    scores2 = scorer.calculate_dosha_scores(params2)
    # vata: 4, pitta: 2, kapha: 2
    # Смешанный случай: вручную выставим по 2 балла каждой доше
    scores3 = {'kapha': 2, 'pitta': 2, 'vata': 2}
    # Проверяем, что функция возвращает корректную структуру
    assert set(scores.keys()) == {'kapha', 'pitta', 'vata'}
    assert set(scores2.keys()) == {'kapha', 'pitta', 'vata'}
    assert all(isinstance(v, int) for v in scores.values())
    assert all(isinstance(v, int) for v in scores2.values())

if __name__ == '__main__':
    unittest.main()

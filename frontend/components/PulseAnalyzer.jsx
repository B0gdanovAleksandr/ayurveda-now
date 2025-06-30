import React, { useState } from 'react';
import { getRandomPulseData } from '../utils/mock_sensor';

const morphologyOptions = [
  { value: '', label: 'Выберите морфологию' },
  { value: 'smooth', label: 'Гладкая' },
  { value: 'sharp', label: 'Острая' },
  { value: 'irregular', label: 'Нерегулярная' },
];

const initialState = {
  hr: '',
  hrv: '',
  amplitude: '',
  morphology: '',
};

const PulseAnalyzer = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!form.hr || isNaN(form.hr)) newErrors.hr = 'Введите число';
    if (!form.hrv || isNaN(form.hrv)) newErrors.hrv = 'Введите число';
    if (!form.amplitude || isNaN(form.amplitude)) newErrors.amplitude = 'Введите число';
    if (!form.morphology) newErrors.morphology = 'Выберите морфологию';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSimulate = () => {
    const mock = getRandomPulseData();
    setForm(mock);
    setErrors({});
    setResult(null);
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hr: form.hr,
          hrv: form.hrv,
          amplitude: form.amplitude,
          morphology: form.morphology,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка запроса');
      setResult(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Анализ пульса</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">&nbsp;</span>
          <button
            type="button"
            onClick={handleSimulate}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm"
            disabled={loading}
          >
            Симулировать данные
          </button>
        </div>
        <div>
          <label className="block font-medium">ЧСС (HR)</label>
          <input
            type="number"
            name="hr"
            value={form.hr}
            onChange={handleChange}
            className={`mt-1 w-full border rounded px-3 py-2 ${errors.hr ? 'border-red-500' : 'border-gray-300'}`}
            min="0"
            step="any"
          />
          {errors.hr && <p className="text-red-500 text-sm">{errors.hr}</p>}
        </div>
        <div>
          <label className="block font-medium">HRV</label>
          <input
            type="number"
            name="hrv"
            value={form.hrv}
            onChange={handleChange}
            className={`mt-1 w-full border rounded px-3 py-2 ${errors.hrv ? 'border-red-500' : 'border-gray-300'}`}
            min="0"
            step="any"
          />
          {errors.hrv && <p className="text-red-500 text-sm">{errors.hrv}</p>}
        </div>
        <div>
          <label className="block font-medium">Амплитуда</label>
          <input
            type="text"
            name="amplitude"
            value={form.amplitude}
            onChange={handleChange}
            className={`mt-1 w-full border rounded px-3 py-2 ${errors.amplitude ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.amplitude && <p className="text-red-500 text-sm">{errors.amplitude}</p>}
        </div>
        <div>
          <label className="block font-medium">Морфология</label>
          <select
            name="morphology"
            value={form.morphology}
            onChange={handleChange}
            className={`mt-1 w-full border rounded px-3 py-2 ${errors.morphology ? 'border-red-500' : 'border-gray-300'}`}
          >
            {morphologyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.morphology && <p className="text-red-500 text-sm">{errors.morphology}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Анализ...' : 'Анализировать'}
        </button>
      </form>
      {apiError && <div className="mt-4 text-red-600 text-center">{apiError}</div>}
      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Результат:</h3>
          <div className="mb-2">
            <span className="font-medium">Преобладающая доша: </span>
            <span className="uppercase text-blue-700 font-bold">{result.dominant_dosha}</span>
          </div>
          <div>
            <span className="font-medium">Баллы:</span>
            <ul className="list-disc ml-6">
              {Object.entries(result.scores).map(([dosha, score]) => (
                <li key={dosha} className="capitalize">{dosha}: <span className="font-bold">{score}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PulseAnalyzer;

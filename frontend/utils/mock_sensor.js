// Мок-сенсор для тестирования анализа пульса
export function getMockPulseData() {
  return [72, 75, 70, 74, 73, 76, 71]; // Примерные значения пульса
}

// Генерация случайных данных пульса
export function getRandomPulseData() {
  const hr = (Math.random() * 60 + 50).toFixed(0); // 50-110
  const hrv = (Math.random() * 70 + 20).toFixed(0); // 20-90
  const morphologies = ['smooth', 'sharp', 'irregular'];
  const amplitudes = ['low', 'medium', 'high'];
  const morphology = morphologies[Math.floor(Math.random() * morphologies.length)];
  const amplitude = amplitudes[Math.floor(Math.random() * amplitudes.length)];
  return {
    hr,
    hrv,
    amplitude,
    morphology,
  };
}

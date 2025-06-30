import React, { useEffect, useState } from 'react';

const HistoryList = () => {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('jwt');
        if (!token) throw new Error('Необходима авторизация');
        const res = await fetch('/records', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Ошибка загрузки');
        }
        const data = await res.json();
        setRecords(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">История анализов</h2>
      {loading && <div>Загрузка...</div>}
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      {!loading && !error && records.length === 0 && (
        <div className="text-gray-500 text-center">Нет записей</div>
      )}
      <ul className="divide-y divide-gray-200">
        {records.map(r => (
          <li
            key={r.id}
            className={`py-3 px-2 cursor-pointer hover:bg-blue-50 rounded ${selected && selected.id === r.id ? 'bg-blue-100' : ''}`}
            onClick={() => setSelected(r)}
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm text-gray-600">{new Date(r.timestamp).toLocaleString()}</span>
              <span className="uppercase font-bold text-blue-700">{r.result_dosha}</span>
            </div>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="mt-6 p-4 bg-gray-50 rounded border">
          <h3 className="font-bold mb-2">Детали анализа</h3>
          <div className="mb-2">
            <span className="font-medium">Дата: </span>
            <span className="font-mono">{new Date(selected.timestamp).toLocaleString()}</span>
          </div>
          <div className="mb-2">
            <span className="font-medium">Преобладающая доша: </span>
            <span className="uppercase text-blue-700 font-bold">{selected.result_dosha}</span>
          </div>
          <div className="mb-2">
            <span className="font-medium">Входные данные:</span>
            <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(selected.raw_input, null, 2)}</pre>
          </div>
          <div>
            <span className="font-medium">Баллы:</span>
            <ul className="list-disc ml-6">
              {Object.entries(selected.dosha_scores).map(([dosha, score]) => (
                <li key={dosha} className="capitalize">{dosha}: <span className="font-bold">{score}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryList; 
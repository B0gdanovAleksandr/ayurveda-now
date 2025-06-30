import React, { useState } from 'react';

const AuthForm = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      if (mode === 'login') {
        localStorage.setItem('jwt', data.access_token);
        onAuth();
      } else {
        setMode('login');
        setEmail('');
        setPassword('');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {mode === 'login' ? 'Вход' : 'Регистрация'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full border rounded px-3 py-2 border-gray-300"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium">Пароль</label>
          <input
            type="password"
            className="mt-1 w-full border rounded px-3 py-2 border-gray-300"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
        </button>
      </form>
      <div className="mt-4 text-center">
        {mode === 'login' ? (
          <button className="text-blue-600 hover:underline" onClick={() => setMode('register')}>Регистрация</button>
        ) : (
          <button className="text-blue-600 hover:underline" onClick={() => setMode('login')}>Уже есть аккаунт?</button>
        )}
      </div>
    </div>
  );
};

export default AuthForm; 
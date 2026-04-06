import { useState } from 'react';
import { Card, PageTitle } from '../components/ui.jsx';
import { mockProfile } from '../mockData.js';

export default function SettingsPage() {
  const [profile, setProfile] = useState(mockProfile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('В демо данные не отправляются. Подключите API для сохранения.');
  };

  return (
    <>
      <PageTitle
        title="Настройки профиля"
        subtitle="Редактирование отображается только в браузере до перезагрузки"
      />
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'phone', 'position'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 capitalize">
                {field === 'name' ? 'Имя' : field === 'position' ? 'Должность' : field}
              </label>
              <input
                name={field}
                value={profile[field]}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          ))}
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Сохранить (демо)
          </button>
        </form>
      </Card>
    </>
  );
}

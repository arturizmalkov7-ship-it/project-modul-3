import { useEffect, useState } from 'react';
import { Card, PageTitle } from '../components/ui.jsx';
import { useAuth } from '../auth.jsx';

export default function SettingsPage() {
  const { profile: me, saveProfile, isDemo } = useAuth();
  const [profile, setProfile] = useState(
    me || {
      name: '',
      email: '',
      phone: '',
      position: '',
    }
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (me) setProfile(me);
  }, [me]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await saveProfile(profile);
      setMessage(isDemo ? 'Профиль сохранен в demo-режиме.' : 'Профиль сохранен.');
    } catch (err) {
      setMessage(err.message || 'Не удалось сохранить профиль.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Настройки профиля"
        subtitle={
          isDemo
            ? 'Demo-режим: изменения хранятся локально до выхода.'
            : 'Изменения сохраняются в профиле Supabase'
        }
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
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </form>
      </Card>
    </>
  );
}

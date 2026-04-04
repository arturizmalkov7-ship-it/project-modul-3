/**
 * Моковые данные CRM (без API).
 * В продакшене заменить на запросы к бэкенду.
 */

/** Этапы воронки сделок — порядок важен для канбан-доски */
export const DEAL_STAGES = [
  { id: 'lead', label: 'Лид', color: 'bg-slate-200 text-slate-800' },
  { id: 'qualified', label: 'Квалификация', color: 'bg-amber-100 text-amber-900' },
  { id: 'proposal', label: 'Предложение', color: 'bg-sky-100 text-sky-900' },
  { id: 'won', label: 'Выиграна', color: 'bg-emerald-100 text-emerald-900' },
  { id: 'lost', label: 'Проиграна', color: 'bg-rose-100 text-rose-900' },
];

export const mockClients = [
  {
    id: 'c1',
    name: 'ООО «Ромашка»',
    email: 'zakaz@romashka.ru',
    phone: '+7 495 123-45-67',
    company: 'Ромашка',
    note: 'Постоянный клиент, оплата по счёту.',
    createdAt: '2025-11-02',
  },
  {
    id: 'c2',
    name: 'ИП Смирнов А.В.',
    email: 'smirnov@mail.ru',
    phone: '+7 912 555-01-02',
    company: 'Смирнов',
    note: '',
    createdAt: '2026-01-15',
  },
  {
    id: 'c3',
    name: 'АНО «Вектор»',
    email: 'office@vector.org',
    phone: '+7 812 000-11-22',
    company: 'Вектор',
    note: 'Нужен договор с НДС.',
    createdAt: '2026-03-01',
  },
];

export const mockDeals = [
  {
    id: 'd1',
    title: 'Поставка оборудования',
    amount: 450000,
    stage: 'proposal',
    clientId: 'c1',
    clientName: 'ООО «Ромашка»',
    comment: 'Ждут КП до пятницы.',
    updatedAt: '2026-04-01',
  },
  {
    id: 'd2',
    title: 'Абонентское обслуживание',
    amount: 120000,
    stage: 'qualified',
    clientId: 'c2',
    clientName: 'ИП Смирнов А.В.',
    comment: '',
    updatedAt: '2026-03-28',
  },
  {
    id: 'd3',
    title: 'Консалтинг Q2',
    amount: 80000,
    stage: 'lead',
    clientId: 'c3',
    clientName: 'АНО «Вектор»',
    comment: 'Первый контакт.',
    updatedAt: '2026-04-03',
  },
  {
    id: 'd4',
    title: 'Лицензии ПО',
    amount: 210000,
    stage: 'won',
    clientId: 'c1',
    clientName: 'ООО «Ромашка»',
    comment: 'Закрыто успешно.',
    updatedAt: '2026-02-10',
  },
];

/** Пользователи для опциональной админ-страницы */
export const mockUsers = [
  { id: 'u1', name: 'Алексей Петров', email: 'alex@crm.local', role: 'admin', active: true },
  { id: 'u2', name: 'Мария Иванова', email: 'maria@crm.local', role: 'manager', active: true },
  { id: 'u3', name: 'Дмитрий Козлов', email: 'dmitry@crm.local', role: 'manager', active: false },
];

/** Текущий «вошедший» пользователь (для страницы настроек) */
export const mockProfile = {
  name: 'Алексей Петров',
  email: 'alex@crm.local',
  phone: '+7 900 111-22-33',
  position: 'Руководитель отдела продаж',
};

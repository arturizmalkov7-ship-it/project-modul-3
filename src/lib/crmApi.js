import { supabase } from './supabase.js';

function mapClient(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    company: row.company || '',
    note: row.note || '',
    createdAt: row.created_at ? row.created_at.slice(0, 10) : '',
  };
}

function mapDeal(row) {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount || 0),
    stage: row.stage,
    clientId: row.client_id,
    clientName: row.clients?.name || '—',
    comment: row.comment || '',
    ownerId: row.owner_id,
    updatedAt: row.updated_at ? row.updated_at.slice(0, 10) : '',
  };
}

function mapProfile(row) {
  return {
    id: row.id,
    name: row.full_name || '',
    email: row.email || '',
    phone: row.phone || '',
    position: row.position || '',
    role: row.role || 'manager',
    active: !!row.is_active,
  };
}

export async function fetchClients() {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapClient);
}

export async function fetchDeals() {
  const { data, error } = await supabase
    .from('deals')
    .select('*, clients(name)')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(mapDeal);
}

export async function createClient(payload, userId) {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
      company: payload.company || null,
      note: payload.note || null,
      created_by: userId,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapClient(data);
}

export async function updateClient(id, payload) {
  const { data, error } = await supabase
    .from('clients')
    .update({
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
      company: payload.company || null,
      note: payload.note || null,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapClient(data);
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

export async function createDeal(payload, ownerId) {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      title: payload.title,
      amount: Number(payload.amount || 0),
      stage: payload.stage,
      client_id: payload.clientId,
      comment: payload.comment || null,
      owner_id: ownerId,
    })
    .select('*, clients(name)')
    .single();
  if (error) throw error;
  return mapDeal(data);
}

export async function updateDeal(id, payload) {
  const { data, error } = await supabase
    .from('deals')
    .update({
      title: payload.title,
      amount: Number(payload.amount || 0),
      stage: payload.stage,
      client_id: payload.clientId,
      comment: payload.comment || null,
    })
    .eq('id', id)
    .select('*, clients(name)')
    .single();
  if (error) throw error;
  return mapDeal(data);
}

export async function deleteDeal(id) {
  const { error } = await supabase.from('deals').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchMyProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return mapProfile(data);
}

export async function updateMyProfile(userId, payload) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      position: payload.position || null,
    })
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(mapProfile);
}

export async function updateUserAdmin(id, patch) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      role: patch.role,
      is_active: patch.active,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapProfile(data);
}

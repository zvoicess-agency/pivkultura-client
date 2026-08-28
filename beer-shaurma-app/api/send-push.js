/* eslint-env node */
/* global process */
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Настраиваем VAPID ключи
webpush.setVapidDetails(
  'mailto:sunseboy@ya.ru',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Создаем клиент Supabase с правами администратора (Service Role)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body } = req.body;

    // Достаем все подписки из базы
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ message: 'Нет активных подписок' });
    }

    const payload = JSON.stringify({ title, body });
    let successCount = 0;

    // Рассылаем уведомления
    for (const subRecord of subscriptions) {
  try {
    await webpush.sendNotification(subRecord.subscription, payload);
    successCount++;
  } catch (err) {
    // Просто выводим ошибку в лог сервера и идем дальше, базу не трогаем
    console.log(`Не удалось отправить пуш для ID ${subRecord.id}:`, err.message);
  }
}

    return res.status(200).json({ success: true, sent: successCount });
  } catch (err) {
    console.error('Ошибка отправки пушей:', err);
    return res.status(500).json({ error: err.message });
  }
}
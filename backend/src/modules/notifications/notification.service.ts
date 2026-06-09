import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { query, pool } from '../../config/database';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';
import { NotificationType } from '../../shared/types';

const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export class NotificationService {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!env.SMTP_HOST) { logger.warn('SMTP not configured'); return; }
    try {
      await mailer.sendMail({ from: env.SMTP_FROM, to, subject, html });
      logger.info('Email sent', { to, subject });
    } catch (err) {
      logger.error('Email send failed', { error: err, to });
    }
  }

  async sendSMS(to: string, body: string): Promise<void> {
    if (!env.TWILIO_SID) { logger.warn('Twilio not configured'); return; }
    try {
      const twilio = require('twilio')(env.TWILIO_SID, env.TWILIO_TOKEN);
      await twilio.messages.create({ body, from: env.TWILIO_FROM, to });
      logger.info('SMS sent', { to });
    } catch (err) {
      logger.error('SMS send failed', { error: err, to });
    }
  }

  async sendPushNotification(fcmToken: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    if (!env.FIREBASE_SERVER_KEY) return;
    try {
      const admin = require('firebase-admin');
      await admin.messaging().send({ token: fcmToken, notification: { title, body }, data });
    } catch (err) {
      logger.error('Push notification failed', { error: err });
    }
  }

  async createNotification(params: {
    title: string;
    body: string;
    type: NotificationType;
    senderId?: string;
    userIds: string[];
    channels?: string[];
  }): Promise<string> {
    const notifId = uuidv4();
    await query(
      `INSERT INTO notifications (id, title, body, type, sender_id) VALUES ($1,$2,$3,$4,$5)`,
      [notifId, params.title, params.body, params.type, params.senderId || null]
    );

    for (const userId of params.userIds) {
      await query(
        `INSERT INTO user_notifications (id, notification_id, user_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [uuidv4(), notifId, userId]
      );
    }

    // Push via FCM
    if (params.channels?.includes('push')) {
      const { rows } = await pool.query(
        `SELECT fcm_token FROM users WHERE id = ANY($1::UUID[]) AND fcm_token IS NOT NULL`,
        [params.userIds]
      );
      for (const row of rows) {
        await this.sendPushNotification(row.fcm_token, params.title, params.body);
      }
    }

    return notifId;
  }

  async notifyAbsence(studentId: string, date: string): Promise<void> {
    const { rows } = await pool.query(
      `SELECT u.first_name, u.last_name, pu.phone, pu.email, pu.fcm_token
       FROM students s
       JOIN student_parents sp ON sp.student_id = s.id AND sp.is_primary = TRUE
       JOIN parents p ON p.id = sp.parent_id
       JOIN users u ON u.id = s.user_id
       JOIN users pu ON pu.id = p.user_id
       WHERE s.id = $1`,
      [studentId]
    );

    if (!rows[0]) return;
    const { first_name, last_name, phone, email } = rows[0];
    const studentName = `${first_name} ${last_name}`;
    const msg = `Dear Parent, ${studentName} was marked ABSENT on ${date}. Please contact school if needed. — शहीद राम सिंह विद्यालय`;

    if (phone) await this.sendSMS(phone, msg);
    if (email) await this.sendEmail(email, 'Absence Alert — ' + studentName,
      `<p>${msg}</p><p>— शहीद राम सिंह विद्यालय</p>`);
  }

  async sendFeeReceipt(studentId: string, amount: number, receiptNo: string): Promise<void> {
    const { rows } = await pool.query(
      `SELECT u.first_name, u.last_name, pu.phone, pu.email
       FROM students s
       JOIN student_parents sp ON sp.student_id = s.id AND sp.is_primary = TRUE
       JOIN parents p ON p.id = sp.parent_id
       JOIN users u ON u.id = s.user_id
       JOIN users pu ON pu.id = p.user_id
       WHERE s.id = $1`,
      [studentId]
    );

    if (!rows[0]) return;
    const { first_name, last_name, phone, email } = rows[0];
    const studentName = `${first_name} ${last_name}`;
    const msg = `Fee payment of ₹${amount} received for ${studentName}. Receipt: ${receiptNo}. — शहीद राम सिंह विद्यालय`;

    if (phone) await this.sendSMS(phone, msg);
    if (email) await this.sendEmail(email, `Fee Receipt ${receiptNo}`,
      `<p>${msg}</p>`);
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    const cond = unreadOnly ? ' AND un.is_read = FALSE' : '';
    const { rows } = await pool.query(
      `SELECT n.id, n.title, n.body, n.type, n.created_at,
              un.is_read, un.read_at
       FROM user_notifications un
       JOIN notifications n ON n.id = un.notification_id
       WHERE un.user_id = $1${cond}
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );
    return rows;
  }

  async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
    await pool.query(
      `UPDATE user_notifications SET is_read = TRUE, read_at = NOW()
       WHERE user_id = $1 AND notification_id = ANY($2::UUID[])`,
      [userId, notificationIds]
    );
  }

  async broadcastAnnouncement(title: string, body: string, senderId: string, roles: string[] = ['admin','teacher','parent','student']): Promise<void> {
    const notifId = uuidv4();
    await query(
      `INSERT INTO notifications (id, title, body, type, sender_id, is_broadcast) VALUES ($1,$2,$3,'announcement',$4,TRUE)`,
      [notifId, title, body, senderId]
    );

    const { rows } = await pool.query(
      `SELECT id, fcm_token FROM users WHERE role = ANY($1::user_role[]) AND is_active = TRUE AND deleted_at IS NULL`,
      [roles]
    );

    for (const user of rows) {
      await query(
        `INSERT INTO user_notifications (id, notification_id, user_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [uuidv4(), notifId, user.id]
      );
      if (user.fcm_token) {
        await this.sendPushNotification(user.fcm_token, title, body).catch(() => {});
      }
    }

    logger.info('Broadcast sent', { notifId, recipients: rows.length });
  }
}

export const notificationService = new NotificationService();

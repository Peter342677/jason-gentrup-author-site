import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent. Please try again later.' },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+\-.]{0,20}$/;

function sanitize(value, maxLen) {
  return String(value ?? '')
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, maxLen);
}

function validate(body) {
  const errors = {};
  const name = sanitize(body.name, 100);
  const email = sanitize(body.email, 150);
  const phone = sanitize(body.phone, 20);
  const message = sanitize(body.message, 2000);

  if (!name) errors.name = 'Name is required.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'A valid email is required.';
  if (phone && !PHONE_RE.test(phone)) errors.phone = 'Enter a valid phone number.';
  if (!message || message.length < 10) errors.message = 'Message must be at least 10 characters.';

  return { errors, data: { name, email, phone, message } };
}

let cachedTransporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  return cachedTransporter;
}

router.post('/', contactLimiter, async (req, res) => {
  // Honeypot: bots fill hidden fields, real users leave it blank.
  if (req.body.website) {
    return res.status(200).json({ success: true });
  }

  const { errors, data } = validate(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const transporter = getTransporter();
  const to = process.env.CONTACT_TO_EMAIL || 'info@authorjasongentrup.com';

  if (!transporter) {
    console.log('[contact] SMTP not configured — logging submission instead:', data);
    return res.status(200).json({ success: true });
  }

  try {
    await transporter.sendMail({
      from: process.env.CONTACT_FROM_EMAIL || `"The Human Compass" <no-reply@authorjasongentrup.com>`,
      to,
      replyTo: data.email,
      subject: `New message from ${data.name} — The Human Compass`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || '—'}\n\n${data.message}`,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[contact] send failed:', err);
    res.status(502).json({ error: 'Could not send your message right now. Please try again shortly.' });
  }
});

export default router;

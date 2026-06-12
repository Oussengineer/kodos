import nodemailer from "nodemailer";

function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

let transporter = createTransporter();

export function getTransporter() {
  if (!transporter) transporter = createTransporter();
  return transporter;
}

export function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3001";
}

export function isMailConfigured() {
  return !!process.env.SMTP_HOST;
}

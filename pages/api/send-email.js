// pages/api/send-email.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, html } = req.body;

  try {
   const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // ensure number
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


    await transporter.sendMail({
      from: `"Real Estate Website" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    // console.error("Email error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

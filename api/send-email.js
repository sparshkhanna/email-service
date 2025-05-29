// File: /api/send-email.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  const {
    name,
    designation,
    organisation,
    email,
    phone,
    message,
    companyEmail,
  } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER, // your Gmail email
      pass: process.env.GMAIL_APP_PASSWORD, // app password
    },
  });

  const mailOptions = {
    from: `\"${name}\" <${process.env.GMAIL_USER}>`,
    to: companyEmail,
    cc: ["sparsh.khanna@icloud.com", "anushka.sikka@dronefederation.in"],
    replyTo: email,
    subject: `New Enquiry from ${name} (${organisation})`,
    text: `
Name: ${name}
Designation: ${designation}
Organisation: ${organisation}
Email: ${email}
Phone: ${phone}

Message:
${message}`.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email", error });
  }
}

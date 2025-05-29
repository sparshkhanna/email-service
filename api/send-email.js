// File: /api/send-email.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }

  try {
    // Validate environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Missing environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error - missing credentials",
      });
    }

    // Validate request body
    const {
      name,
      designation,
      organisation,
      email,
      phone,
      message,
      companyEmail,
    } = req.body;

    if (!name || !email || !message || !companyEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    console.log("Creating transporter...");

    // Create transporter - FIXED: Use nodemailer.createTransporter instead of nodemailer.createTransporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("Verifying transporter...");

    // Verify connection
    await transporter.verify();
    console.log("Transporter verified successfully");

    // Email options
    const mailOptions = {
      from: `"${name}" <${process.env.GMAIL_USER}>`, // Use your Gmail as sender
      to: companyEmail,
      cc: ["sparsh.khanna@icloud.com", "anushka.sikka@dronefederation.in"],
      replyTo: email, // User's email for replies
      subject: `New Enquiry from ${name} (${organisation || "Individual"})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
            New Contact Enquiry
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            ${designation ? `<p><strong>Designation:</strong> ${designation}</p>` : ""}
            ${organisation ? `<p><strong>Organisation:</strong> ${organisation}</p>` : ""}
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          </div>

          <div style="background: #fff; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This enquiry was sent through your website contact form.</p>
            <p>Reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      `,
      text: `
New Contact Enquiry

Name: ${name}
${designation ? `Designation: ${designation}` : ""}
${organisation ? `Organisation: ${organisation}` : ""}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}

Message:
${message}

---
This enquiry was sent through your website contact form.
Reply directly to this email to respond to ${name}.
      `.trim(),
    };

    console.log("Sending email...");

    // Send email with proper await
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    // Success response
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Detailed email error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // More specific error messages
    let errorMessage = "Failed to send email";

    if (error.code === "EAUTH") {
      errorMessage = "Authentication failed - check Gmail credentials";
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Connection failed - check network settings";
    } else if (error.message.includes("Invalid login")) {
      errorMessage = "Invalid Gmail credentials";
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

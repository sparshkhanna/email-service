import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    name,
    designation,
    organisation,
    email,
    phone,
    message,
    companyEmail,
  } = req.body;

  const fullMessage = `
Name: ${name}
Designation: ${designation}
Organisation: ${organisation}
Email: ${email}
Phone: ${phone}

Message:
${message}
  `.trim();

  try {
    const data = await resend.emails.send({
      from: "Drone Enquiry <onboarding@resend.dev>",
      to: companyEmail,
      cc: ["sparsh.khanna@icloud.com"],
      reply_to: email,
      subject: `New Enquiry from ${name} (${organisation})`,
      text: fullMessage,
    });

    return res.status(200).json({ message: "Email sent", id: data.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Email failed", error });
  }
};

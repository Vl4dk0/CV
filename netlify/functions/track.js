const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: event.httpMethod === "GET" ? 200 : 405, body: "" };
  }

  let p;
  try {
    p = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // only send email on the 'end' event
  if (p.event === "end") {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = `⏱️ CV - (session ${p.sessionId})`;
    const text =
      `Started at: ${p.timestampStart}\n` +
      `Ended at:   ${p.timestamp}\n` +
      `Duration:   ${p.durationSec}s`;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.TO_EMAIL,
        subject,
        text,
      });
      console.log("Email sent for session:", p.sessionId);
    } catch (err) {
      console.error("Email send error:", err);
    }
  }

  return { statusCode: 200, body: "ok" };
};

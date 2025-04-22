const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
console.log("🔍 EMAIL_USER:", process.env.EMAIL_USER);
console.log("🔍 EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");


const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: Verify SMTP connection
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email server not ready:", err);
  } else {
    console.log("✅ Email server ready to send emails");
  }
});

// Contact Route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  console.log("📥 Received contact form:", req.body);

  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Submission from ${name}`,
    text: `Message: ${message}\n\nFrom: ${name} <${email}>`,
    replyTo: email,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", result.response);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" , fullError: error, // 👈 ADD THIS
      errorMessage: error.message, // 👈 ADD THIS
      stack: error.stack, });
    
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

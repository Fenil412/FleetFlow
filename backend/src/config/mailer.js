import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // TLS (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection on startup (non-blocking)
transporter.verify((err) => {
    if (err) {
        console.warn('[MAILER] SMTP connection failed — email sending disabled:', err.message);
    } else {
        console.log('[MAILER] SMTP ready ✓');
    }
});

export default transporter;

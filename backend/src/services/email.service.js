import transporter from '../config/mailer.js';

const FROM = process.env.SMTP_FROM || '"FleetFlow" <noreply@fleetflow.com>';

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc; padding: 0; margin: 0;
`;
const cardStyle = `
  max-width: 540px; margin: 40px auto; background: #ffffff;
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;
const headerStyle = `
  background: linear-gradient(135deg, #2563EB, #1e40af);
  padding: 32px 40px; text-align: center;
`;
const bodyStyle = `padding: 32px 40px;`;
const footerStyle = `
  background: #f1f5f9; padding: 20px 40px;
  text-align: center; color: #64748b; font-size: 12px;
`;
const btnStyle = `
  display: inline-block; background: #2563EB; color: #fff !important;
  padding: 14px 32px; border-radius: 12px; text-decoration: none;
  font-weight: 700; font-size: 14px; letter-spacing: 0.05em;
  margin: 16px 0;
`;

const buildHTML = (title, bodyHTML) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${baseStyle}">
  <div style="${cardStyle}">
    <div style="${headerStyle}">
      <img src="https://img.icons8.com/ios-filled/50/ffffff/truck.png" width="48" style="margin-bottom:12px" alt="truck"/>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px">FleetFlow</h1>
      <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Fleet & Logistics Management</p>
    </div>
    <div style="${bodyStyle}">
      <h2 style="color:#1e293b;font-size:20px;margin:0 0 16px;font-weight:800">${title}</h2>
      ${bodyHTML}
    </div>
    <div style="${footerStyle}">
      <p style="margin:0">© ${new Date().getFullYear()} FleetFlow. This is an automated message — please do not reply.</p>
    </div>
  </div>
</body>
</html>`;

/**
 * Send welcome email on registration
 */
export const sendWelcomeEmail = async (to, name, role) => {
    try {
        await transporter.sendMail({
            from: FROM, to,
            subject: '🚛 Welcome to FleetFlow!',
            html: buildHTML('Welcome aboard, ' + name + '!', `
              <p style="color:#475569;line-height:1.6">Your FleetFlow account has been successfully created.</p>
              <table style="background:#f8fafc;border-radius:12px;padding:16px;width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="color:#64748b;font-size:13px;padding:4px 8px;font-weight:600">Email</td><td style="color:#1e293b;font-weight:700;font-size:13px;padding:4px 8px">${to}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;padding:4px 8px;font-weight:600">Role</td><td style="color:#2563EB;font-weight:800;font-size:13px;padding:4px 8px">${role}</td></tr>
              </table>
              <p style="color:#64748b;font-size:13px;margin-top:16px">If you didn't create this account, please contact your fleet manager immediately.</p>
            `),
        });
    } catch (err) { console.warn('[EMAIL] Welcome email failed:', err.message); }
};

/**
 * Send login alert email
 */
export const sendLoginAlertEmail = async (to, name) => {
    try {
        const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        await transporter.sendMail({
            from: FROM, to,
            subject: '🔐 New Sign-In to FleetFlow',
            html: buildHTML('Sign-in Detected', `
              <p style="color:#475569;line-height:1.6">Hi <strong>${name}</strong>, we detected a new sign-in to your account.</p>
              <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0;border-left:4px solid #2563EB">
                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600">Time</p>
                <p style="margin:4px 0 0;font-size:14px;color:#1e293b;font-weight:700">${time} (IST)</p>
              </div>
              <p style="color:#64748b;font-size:13px">Not you? Reset your password immediately.</p>
            `),
        });
    } catch (err) { console.warn('[EMAIL] Login alert failed:', err.message); }
};

/**
 * Send OTP for forgot password
 */
export const sendOTPEmail = async (to, name, otp) => {
    try {
        await transporter.sendMail({
            from: FROM, to,
            subject: '🔑 Your FleetFlow Password Reset OTP',
            html: buildHTML('Password Reset OTP', `
              <p style="color:#475569;line-height:1.6">Hi <strong>${name}</strong>, use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
              <div style="text-align:center;margin:24px 0">
                <div style="display:inline-block;background:linear-gradient(135deg,#2563EB,#1e40af);border-radius:16px;padding:20px 40px">
                  <span style="color:#fff;font-size:36px;font-weight:900;letter-spacing:12px;font-family:monospace">${otp}</span>
                </div>
              </div>
              <p style="color:#ef4444;font-size:13px;font-weight:600;text-align:center">⚠️ Never share this OTP with anyone</p>
            `),
        });
    } catch (err) { console.warn('[EMAIL] OTP email failed:', err.message); }
};

/**
 * Send password reset success email
 */
export const sendPasswordResetSuccessEmail = async (to, name) => {
    try {
        const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        await transporter.sendMail({
            from: FROM, to,
            subject: '✅ Password Changed Successfully',
            html: buildHTML('Password Updated', `
              <p style="color:#475569;line-height:1.6">Hi <strong>${name}</strong>, your FleetFlow password was successfully changed.</p>
              <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin:16px 0;border-left:4px solid #22c55e">
                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600">Changed at</p>
                <p style="margin:4px 0 0;font-size:14px;color:#1e293b;font-weight:700">${time} (IST)</p>
              </div>
              <p style="color:#64748b;font-size:13px">If you did not make this change, contact your fleet administrator immediately.</p>
            `),
        });
    } catch (err) { console.warn('[EMAIL] Reset success email failed:', err.message); }
};

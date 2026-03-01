import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Email core function
 */
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Resend] Email skipped: API Key not configured');
      return;
    }

    // Resend trial accounts can only send to verified emails.
    // If RESEND_TRIAL_MODE is 'true', we redirect all emails to the verified email.
    // Otherwise, we send to the actual recipient (which requires domain verification).
    const isTrial = process.env.RESEND_TRIAL_MODE === 'true';
    const recipient = isTrial ? (process.env.RESEND_VERIFIED_EMAIL || to) : to;

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use onboarding fallback
      to: [recipient],
      subject,
      html,
    });
    if (error) {
      console.error('[Resend] Error response:', error);
      return;
    }

    console.log(`[Resend] Email sent successfully to ${recipient}. ID: ${data.id}`);
    return data;
  } catch (err) {
    console.error(`[Resend] Unexpected error sending email to ${to}:`, err.message);
    // silent fail
  }
};

/**
 * Send welcome email on registration
 */
export const sendWelcomeEmail = async (to, name, role) => {
  const subject = 'Welcome to FleetFlow!';
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #2563eb;">Welcome to FleetFlow!</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your account has been created successfully with the role: <strong>${role}</strong>.</p>
            <p>You can now log in and start managing your fleet operations.</p>
            <br>
            <p>Cheers,<br>The FleetFlow Team</p>
        </div>
    `;
  return sendEmail(to, subject, html);
};

/**
 * Send login alert
 */
export const sendLoginAlertEmail = async (to, name) => {
  const subject = 'Security Alert: New Login';
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #dc2626;">New Login Detected</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>We detected a new login to your FleetFlow account on ${new Date().toLocaleString()}.</p>
            <p>If this was you, you can ignore this email. If not, please change your password immediately.</p>
            <br>
            <p>Cheers,<br>The FleetFlow Team</p>
        </div>
    `;
  return sendEmail(to, subject, html);
};

/**
 * Send OTP for forgot password
 */
export const sendOTPEmail = async (to, name, otp) => {
  const subject = 'FleetFlow Password Reset - OTP';
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #2563eb;">Password Reset OTP</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>You requested to reset your password. Use the OTP below to proceed:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                ${otp}
            </div>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you did not request this, please contact support.</p>
            <br>
            <p>Cheers,<br>The FleetFlow Team</p>
        </div>
    `;
  return sendEmail(to, subject, html);
};

/**
 * Send password reset success
 */
export const sendPasswordResetSuccessEmail = async (to, name) => {
  const subject = 'Password Updated Successfully';
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #16a34a;">Password Updated</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your password has been successfully updated.</p>
            <p>If you did not make this change, please contact support immediately.</p>
            <br>
            <p>Cheers,<br>The FleetFlow Team</p>
        </div>
    `;
  return sendEmail(to, subject, html);
};

/**
 * Notify manager of maintenance
 */
export const sendMaintenanceAlertEmail = async (to, vehicleName, serviceType, cost) => {
  const subject = `Maintenance Alert: ${vehicleName}`;
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #ea580c;">Vehicle Maintenance Logged</h2>
            <p>A new maintenance log has been created for: <strong>${vehicleName}</strong></p>
            <ul>
                <li><strong>Service:</strong> ${serviceType}</li>
                <li><strong>Cost:</strong> ₹${cost}</li>
                <li><strong>Status:</strong> Moved to IN_SHOP</li>
            </ul>
            <br>
            <p>System Automated Notification</p>
        </div>
    `;
  return sendEmail(to, subject, html);
};

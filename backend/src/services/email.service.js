import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

const sendEmail = async (templateId, templateParams) => {
  try {
    const payload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        ...templateParams,
        notification_email: process.env.EMAILJS_NOTIFICATION_EMAIL
      },
    };

    const response = await axios.post(EMAILJS_URL, payload);
    console.log(`[EMAILJS] Sent template ${templateId} successfully:`, response.data);
    return response.data;
  } catch (err) {
    console.warn(`[EMAILJS] Error sending ${templateId}:`, err.response?.data || err.message);
    throw err;
  }
};

/**
 * Send welcome email on registration
 */
export const sendWelcomeEmail = async (to, name, role) => {
  try {
    if (!process.env.EMAILJS_TEMPLATE_WELCOME) return;
    await sendEmail(process.env.EMAILJS_TEMPLATE_WELCOME, {
      to_email: to,
      user_name: name,
      user_role: role,
    });
  } catch (err) { /* silent fail */ }
};

/**
 * Send login alert - DISABLED (Free Plan Limit)
 */
export const sendLoginAlertEmail = async (to, name) => {
  // console.log('[EMAIL] Login alert skipped (Free Plan Limit)');
};

/**
 * Send OTP for forgot password
 */
export const sendOTPEmail = async (to, name, otp) => {
  try {
    if (!process.env.EMAILJS_TEMPLATE_OTP) return;
    await sendEmail(process.env.EMAILJS_TEMPLATE_OTP, {
      to_email: to,
      user_name: name,
      otp_code: otp,
    });
  } catch (err) { /* silent fail */ }
};

/**
 * Send password reset success - DISABLED (Free Plan Limit)
 */
export const sendPasswordResetSuccessEmail = async (to, name) => {
  // console.log('[EMAIL] Password reset success email skipped (Free Plan Limit)');
};

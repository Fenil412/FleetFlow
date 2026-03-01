import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Format phone number for Twilio (Ensure + prefix)
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    let p = phone.trim();
    if (p.startsWith('+')) return p;
    // Assume India (+91) if 10 digits and no prefix
    if (p.length === 10) return `+91${p}`;
    return `+${p}`; // Fallback: just add +
};

/**
 * Send SMS core function
 */
export const sendSMS = async (to, body) => {
    const formattedTo = formatPhoneNumber(to);
    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.warn('[Twilio] SMS skipped: Credentials not configured');
            return;
        }

        const message = await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedTo
        });

        console.log(`[Twilio] SMS sent successfully to ${formattedTo}. SID: ${message.sid}`);
        return message;
    } catch (err) {
        console.error(`[Twilio] Error sending SMS to ${to}:`, err);
        // silent fail to avoid breaking main flow
    }
};

/**
 * Send welcome SMS on registration
 */
export const sendWelcomeSMS = async (to, name, role) => {
    if (!to) return;
    const body = `Welcome to FleetFlow, ${name}! Your account as ${role} has been created successfully.`;
    return sendSMS(to, body);
};

/**
 * Send OTP for forgot password
 */
export const sendOTPSMS = async (to, name, otp) => {
    if (!to) return;
    const body = `Hi ${name}, your FleetFlow OTP is: ${otp}. Valid for 10 minutes.`;
    return sendSMS(to, body);
};

/**
 * Send password reset success notification
 */
export const sendPasswordResetSuccessSMS = async (to, name) => {
    if (!to) return;
    const body = `Hi ${name}, your FleetFlow password has been updated successfully.`;
    return sendSMS(to, body);
};

/**
 * Notify driver of trip dispatch
 */
export const sendTripDispatchSMS = async (to, name, vehicle, origin, destination) => {
    if (!to) return;
    const body = `Hi ${name}, you've been dispatched for a trip! \nVehicle: ${vehicle}\nFrom: ${origin}\nTo: ${destination}`;
    return sendSMS(to, body);
};

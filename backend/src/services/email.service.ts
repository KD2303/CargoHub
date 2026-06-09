import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = 'no-reply@cargohub.com'; // Change to verified domain when available

export const emailService = {
  async sendEmailVerification(email: string, name: string, token: string) {
    if (!resend) {
      console.log(`[MOCK EMAIL] Verification email to ${email} with token: ${token}`);
      return;
    }
    
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Verify your CargoHub Account',
        html: `<p>Hi ${name},</p><p>Please verify your email using this token: <strong>${token}</strong></p>`
      });
    } catch (error) {
      console.error('Failed to send verification email', error);
    }
  },

  async sendKycApproved(email: string, name: string) {
    if (!resend) {
      console.log(`[MOCK EMAIL] KYC Approved email to ${email}`);
      return;
    }
    
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'KYC Approved - You can now drive!',
        html: `<p>Hi ${name},</p><p>Your KYC documents have been approved. You can now go online and accept bookings.</p>`
      });
    } catch (error) {
      console.error('Failed to send KYC email', error);
    }
  },

  async sendBookingConfirmation(email: string, name: string, bookingRef: string) {
    if (!resend) {
      console.log(`[MOCK EMAIL] Booking confirmation to ${email} for ref ${bookingRef}`);
      return;
    }
    
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Booking Confirmed: ${bookingRef}`,
        html: `<p>Hi ${name},</p><p>Your booking <strong>${bookingRef}</strong> has been confirmed.</p>`
      });
    } catch (error) {
      console.error('Failed to send booking email', error);
    }
  }
};

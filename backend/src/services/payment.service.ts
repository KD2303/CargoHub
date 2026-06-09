import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export const paymentService = {
  /**
   * Create a new Razorpay order
   */
  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    if (!razorpay) {
      console.warn('Razorpay not configured. Returning mock order.');
      return {
        id: `order_${Date.now()}`,
        amount: amount * 100, // Amount in paise
        currency,
        receipt,
        status: 'created'
      };
    }

    try {
      const options = {
        amount: Math.round(amount * 100), // convert to paise
        currency,
        receipt,
      };
      
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Failed to create Razorpay order', error);
      throw new Error('Payment gateway error');
    }
  },

  /**
   * Verify Razorpay payment signature
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!process.env.RAZORPAY_KEY_SECRET) return true; // Mock verification if no secret

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
      
    return expectedSignature === signature;
  }
};

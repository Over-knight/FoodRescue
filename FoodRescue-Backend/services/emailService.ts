import nodemailer from "nodemailer";

// Email transporter configuration
const createTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT || "587");
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "",
    // "mail.privateemail.com",
    port: port,
    secure: port === 465, // true for 465 (SSL), false for 587 (TLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // Don't fail on invalid certs (helpful for testing)
      rejectUnauthorized: false,
      minVersion: 'TLSv1', // Try older version
      maxVersion: 'TLSv1.2',
      ciphers: 'DEFAULT:!DH' // Try different cipher suite
    },
    // Add connection timeout
    connectionTimeout: 60000, 
    greetingTimeout: 30000,  
    socketTimeout: 60000,   
  });
};

const createVerificationEmailTemplate = (verificationCode: string) => {
  return {
    subject: "Verify Your FoodRescue Account",
    text: `
Welcome to FoodRescue!

Your verification code is: ${verificationCode}

This code will expire in 15 minutes.

If you didn't request this, please ignore this email.

Best regards,
The FoodRescue Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .code { background-color: #f8f9fa; border: 2px solid #28a745; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 2px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to FoodRescue!</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up with FoodRescue. To complete your registration, please use the verification code below:</p>
            
            <div class="code">${verificationCode}</div>
            
            <p><strong>This code will expire in 15 minutes.</strong></p>
            
            <p>If you didn't request this verification, please ignore this email.</p>
            
            <p>Best regards,<br>The FoodRescue Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 FoodRescue. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `,
  };
};

const createPasswordResetTemplate = (resetCode: string) => {
  return {
    subject: "Reset Your FoodRescue Password",
    text: `
Password Reset Request

Your password reset code is: ${resetCode}

This code will expire in 15 minutes.

If you didn't request this, please ignore this email.

Best regards,
The FoodRescue Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .code { background-color: #f8f9fa; border: 2px solid #dc3545; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 2px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset</h1>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your FoodRescue account password. Use the code below to proceed:</p>
            
            <div class="code">${resetCode}</div>
            
            <p><strong>This code will expire in 15 minutes.</strong></p>
            
            <p>If you didn't request this password reset, please ignore this email.</p>
            
            <p>Best regards,<br>The FoodRescue Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 FoodRescue. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `,
  };
};


class EmailService {
  private transporter: any;

  constructor() {
    // Don't create transporter in constructor - create it when needed
    this.transporter = null;
  }

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = createTransporter();
    }
    return this.transporter;
  }

  // Test email connection with better error handling
  async testConnection(): Promise<boolean> {
    try {
      await this.getTransporter().verify();
      console.log("Email service connected successfully");
      return true;
    } catch (error: any) {
      console.error("Email service connection failed:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error);
      return false;
    }
  }

  // Send verification email
  async sendVerificationEmail(email: string, verificationCode: string): Promise<boolean> {
    try {
      const template = createVerificationEmailTemplate(verificationCode);
      
      const info = await this.getTransporter().sendMail({
        from: process.env.EMAIL_FROM || `"FoodRescue" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });

      console.log("Verification email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending verification email:", error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, resetCode: string): Promise<boolean> {
    try {
      const template = createPasswordResetTemplate(resetCode);
      
      const info = await this.getTransporter().sendMail({
        from: process.env.EMAIL_FROM || `"FoodRescue" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });

      console.log("Password reset email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return false;
    }
  }


  // Send order confirmation email
  async sendOrderConfirmationEmail(email: string, orderData: {
    orderNumber: string;
    customerName: string;
    items: Array<{ productName: string; quantity: number; price: number }>;
    subtotal: number;
    // deliveryFee: number;
    totalAmount: number;
    // deliveryAddress: string;
    paymentMethod: string;
    handoverCode?: string;
  }): Promise<boolean> {
    try {
      const itemsList = orderData.items.map(item =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₦${(item.price / 100).toFixed(2)}</td>
        </tr>`
      ).join('');

      const handoverCodeSection = orderData.handoverCode ? `
            <div class="info-box">
                <h4>Delivery Verification Code</h4>
                <p>Please share this code with the store when you're about to pick up your order. The store will enter it to confirm delivery.</p>
                <div class="order-number" style="margin-top: 10px;">${orderData.handoverCode}</div>
            </div>
      ` : '';

      const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .order-number { background-color: #f8f9fa; border: 2px solid #28a745; padding: 15px; font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background-color: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .info-box { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
            <p>Dear ${orderData.customerName},</p>

            <p>Thank you for your order! We've received it and will start processing it shortly.</p>

            <div class="order-number">
                Order Number: ${orderData.orderNumber}
            </div>

            <h3>Order Summary</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Quantity</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList}
                    <tr>
                        <td colspan="2" style="padding: 10px; text-align: right;">Subtotal:</td>
                        <td style="padding: 10px; text-align: right;">₦${(orderData.subtotal / 100).toFixed(2)}</td>
                    </tr>

                    <tr class="total-row">
                        <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
                        <td style="padding: 10px; text-align: right;">₦${(orderData.totalAmount / 100).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="info-box">
                <h4>Delivery Information</h4>
                <p><strong>Payment Method:</strong> ${orderData.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            </div>

            ${handoverCodeSection}

            <p>If you have any questions, please don't hesitate to contact us.</p>

            <p>Best regards,<br>The FoodRescue Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FoodRescue. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `;

      const text = `
Order Confirmed!

Dear ${orderData.customerName},

Thank you for your order! You can now head over to the store with your hand over code.

Order Number: ${orderData.orderNumber}

Order Summary:
${orderData.items.map(item => `- ${item.productName} x${item.quantity}: ₦${(item.price / 100).toFixed(2)}`).join('\n')}

Subtotal: ₦${(orderData.subtotal / 100).toFixed(2)}
Total: ₦${(orderData.totalAmount / 100).toFixed(2)}

Payment Method: ${orderData.paymentMethod.replace('_', ' ').toUpperCase()}

Best regards,
The FoodRescue Team
      `;

      const info = await this.getTransporter().sendMail({
        from: process.env.EMAIL_FROM || `"FoodRescue" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        text,
        html,
      });

      console.log("Order confirmation email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return false;
    }
  }

  // Send payment success email
  async sendPaymentSuccessEmail(email: string, data: {
    orderNumber: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
  }): Promise<boolean> {
    try {
      const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        .amount-box { background-color: #d4edda; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
        .amount { font-size: 32px; font-weight: bold; color: #28a745; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Successful!</h1>
        </div>
        <div class="content">
            <div class="success-icon">✓</div>

            <p>Dear ${data.customerName},</p>

            <p>Your payment has been successfully processed!</p>

            <div class="amount-box">
                <div style="font-size: 16px; color: #666; margin-bottom: 10px;">Amount Paid</div>
                <div class="amount">₦${(data.amount / 100).toFixed(2)}</div>
            </div>

            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod.replace('_', ' ').toUpperCase()}</p>

            <p>Your order is now being processed and will be shipped soon. We'll keep you updated on its progress.</p>

            <p>Thank you for shopping with FoodRescue!</p>

            <p>Best regards,<br>The FoodRescue Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FoodRescue. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `;

      const text = `
Payment Successful!

Dear ${data.customerName},

Your payment has been successfully processed!

Amount Paid: ₦${(data.amount / 100).toFixed(2)}
Order Number: ${data.orderNumber}
Payment Method: ${data.paymentMethod.replace('_', ' ').toUpperCase()}

Your order is now being processed and will be shipped soon. We'll keep you updated on its progress.

Thank you for shopping with FoodRescue!

Best regards,
The FoodRescue Team
      `;

      const info = await this.getTransporter().sendMail({
        from: process.env.EMAIL_FROM || `"FoodRescue" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Payment Confirmed - ${data.orderNumber}`,
        text,
        html,
      });

      console.log("Payment success email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending payment success email:", error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
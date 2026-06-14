import transporter from '../config/nodemailer.js';

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"HackMatch" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'HackMatch - Verify Your Email Address',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF; color: #0F172A;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1E3A8A; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Welcome to HackMatch</h2>
          <p style="color: #475569; margin: 5px 0 0 0; font-size: 14px;">Find the Right Team. Build Better Projects.</p>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #334155; margin-bottom: 20px;">
          Thank you for signing up. Please enter the following 6-digit verification code to complete your registration.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #3B82F6; background-color: #F8FAFC; border: 2px dashed #E2E8F0; padding: 12px 30px; border-radius: 8px;">
            ${otp}
          </div>
        </div>
        <p style="font-size: 14px; color: #64748B; line-height: 1.5; margin-bottom: 20px;">
          This OTP is valid for <strong>10 minutes</strong>. If you did not request this verification, you can safely ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
          © 2026 HackMatch. All rights reserved.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (email, otp) => {
  const mailOptions = {
    from: `"HackMatch" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'HackMatch - Reset Your Password',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF; color: #0F172A;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1E3A8A; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Password Reset Request</h2>
          <p style="color: #475569; margin: 5px 0 0 0; font-size: 14px;">Find the Right Team. Build Better Projects.</p>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #334155; margin-bottom: 20px;">
          We received a request to reset your password. Use the verification code below to authorize the password reset.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #EF4444; background-color: #F8FAFC; border: 2px dashed #E2E8F0; padding: 12px 30px; border-radius: 8px;">
            ${otp}
          </div>
        </div>
        <p style="font-size: 14px; color: #64748B; line-height: 1.5; margin-bottom: 20px;">
          This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please change your password from account settings and check your security.
        </p>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
          © 2026 HackMatch. All rights reserved.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const nodemailer = require('nodemailer');

// 创建 transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 发送邮件函数
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"东源E栖谷" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('邮件发送成功:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('邮件发送失败:', error);
    return { success: false, error };
  }
};

module.exports = sendEmail;
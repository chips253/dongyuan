const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // 可选，用于生成随机令牌
const sendEmail = require('../utils/email'); // 引入邮件发送工具

// 密码强度验证函数
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
};

// 注册
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: '密码必须至少8位，且包含大小写字母和数字' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取当前用户信息
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 忘记密码 - 生成重置令牌并发送邮件
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // 为安全起见，即使邮箱不存在也返回成功提示，防止邮箱枚举
      return res.json({ message: '如果邮箱存在，重置链接将发送到您的邮箱' });
    }

    // 生成重置令牌（使用 JWT，有效期1小时）
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 保存令牌和过期时间到数据库（可选，使用 JWT 后可以不用存储，但存储可额外验证）
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1小时后过期
    await user.save();

    // 构建重置链接（前端页面地址）
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // 发送真实邮件
    const emailResult = await sendEmail({
      to: user.email,
      subject: '东源E栖谷 - 密码重置',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #3e9c4c;">密码重置</h2>
          <p>您好 ${user.name}，</p>
          <p>您最近请求重置密码，请点击以下链接完成重置（链接有效期为1小时）：</p>
          <p><a href="${resetUrl}" style="background-color: #3e9c4c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">重置密码</a></p>
          <p>如果链接无法点击，请复制以下地址到浏览器：</p>
          <p>${resetUrl}</p>
          <p>如果您未请求重置，请忽略此邮件。</p>
          <hr>
          <p style="color: #999; font-size: 12px;">东源E栖谷团队</p>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error('邮件发送失败，但重置令牌已生成');
      // 这里可根据业务需求决定是否返回错误
      return res.json({ message: '重置链接已生成，但邮件发送失败，请联系管理员' });
    }

    res.json({ message: '重置链接已发送到您的邮箱' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // 验证 token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: '重置链接无效或已过期' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ error: '用户不存在' });
    }

    // 可选：检查数据库中存储的令牌（如果使用了存储）
    // if (user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
    //   return res.status(400).json({ error: '重置链接无效或已过期' });
    // }

    // 验证新密码强度
    if (!validatePassword(password)) {
      return res.status(400).json({ error: '密码必须至少8位，且包含大小写字母和数字' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // 清除令牌
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: '密码重置成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};
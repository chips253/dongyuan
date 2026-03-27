const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // 新增：用于处理静态文件路径
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 静态文件服务：提供上传的图片访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 已有路由（首页）
app.use('/api/stats', require('./routes/stats'));
app.use('/api/news', require('./routes/news'));

// 新增路由（产品包）
app.use('/api/products', require('./routes/products'));
app.use('/api/packages', require('./routes/packages'));

// 新增探索路由
app.use('/api/skills', require('./routes/skills'));
// 新增探索项目路由（与原有 projects 区分）
app.use('/api/explore', require('./routes/explore'));
app.use('/api/rankings', require('./routes/rankings'));

// 新增社群中心路由
app.use('/api/activities', require('./routes/activities'));
app.use('/api/topics', require('./routes/topics'));

// 新增可选路由：搭子类别和微信群精选
app.use('/api/buddies', require('./routes/buddies'));
app.use('/api/wechat', require('./routes/wechat'));

// 新增案例库路由
app.use('/api/cases', require('./routes/cases'));

app.use('/api/auth', require('./routes/auth')); // 认证路由（登录、注册）
// 新增个人中心路由
app.use('/api/profile', require('./routes/profile'));
// 新增后台管理路由
app.use('/api/admin', require('./routes/admin'));

app.use('/api/badges', require('./routes/badges'));

// 新增积分商城路由
app.use('/api/rewards', require('./routes/rewards'));

app.use('/api/bookings', require('./routes/bookings'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
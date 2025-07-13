const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const path = require('path');

// 記憶體資料庫：短碼 -> 原始網址
const urlDatabase = {};

// 產生短碼
function generateShortCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// 提供靜態檔案（前端用）
app.use(express.static(path.join(__dirname, 'public')));

// 短碼跳轉邏輯
app.get('/:shortCode', (req, res) => {
  const shortCode = req.params.shortCode;
  const originalUrl = urlDatabase[shortCode];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send('Short URL not found');
  }
});

// Socket.IO 通訊
io.on('connection', (socket) => {
  console.log('使用者連線');

  socket.on('shorten-url', (originalUrl) => {
    const shortCode = generateShortCode();
    urlDatabase[shortCode] = originalUrl;
    const shortUrl = `${socket.handshake.headers.origin || 'https://cococolacat.github.io'}/${shortCode}`;
    socket.emit('shorten-result', shortUrl);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`伺服器啟動於 http://localhost:${PORT}`);
});

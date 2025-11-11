const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: 'http://localhost:3000',
    credentials: true
  }
});
// Make sure uploads directory exists
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at', uploadsDir);
}

// Expose io through the express app so controllers can access it
app.set('io', io);

// Simple socket connection handler: clients can join rooms (e.g., user_<id>)
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));


app.get('/', (req, res) => {
  res.send('Video App Backend is running!');
});

const PORT = process.env.PORT || 4000;

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; // Export for testing

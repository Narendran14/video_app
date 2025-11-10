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

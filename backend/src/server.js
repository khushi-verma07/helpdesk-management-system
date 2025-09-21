const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const SLAScheduler = require('./utils/slaScheduler');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent caching for API responses
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Test database connection
const pool = require('./config/database');
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Ticketing System API is running!', timestamp: new Date() });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Ticket routes
app.use('/api/tickets', require('./routes/tickets'));

// Admin routes
app.use('/api/admin', require('./routes/admin'));

// Analytics routes
app.use('/api/analytics', require('./routes/analytics'));

// SLA monitoring endpoint
app.get('/api/sla/stats', async (req, res) => {
  try {
    const SLAScheduler = require('./utils/slaScheduler');
    const stats = await SLAScheduler.getOverdueStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Join ticket room
  socket.on('join-ticket', (ticketId) => {
    socket.join(`ticket-${ticketId}`);
    console.log(`User ${socket.userId} joined ticket ${ticketId}`);
  });
  
  // Handle new message
  socket.on('send-message', async (data) => {
    try {
      const { ticketId, message, isInternal } = data;
      const Ticket = require('./models/Ticket');
      
      let messageId;
      if (isInternal) {
        messageId = await Ticket.addInternalNote(ticketId, socket.userId, message);
      } else {
        messageId = await Ticket.addMessage(ticketId, socket.userId, message);
      }
      
      // Get the complete message with user info
      const messages = await Ticket.getMessages(ticketId);
      const newMessage = messages.find(m => m.id === messageId);
      
      // Broadcast to all users in the ticket room
      io.to(`ticket-${ticketId}`).emit('new-message', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: error.message });
    }
  });
  
  // Handle status update
  socket.on('update-status', async (data) => {
    try {
      const { ticketId, status } = data;
      const Ticket = require('./models/Ticket');
      
      await Ticket.updateStatus(ticketId, status, socket.userId);
      
      // Broadcast status update to all users in the ticket room
      io.to(`ticket-${ticketId}`).emit('status-updated', { ticketId, status });
    } catch (error) {
      console.error('Error updating status:', error);
      socket.emit('status-error', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Start SLA monitoring
  SLAScheduler.start();
});
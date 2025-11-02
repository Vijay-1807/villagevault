const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const alertRoutes = require('./routes/alerts');
const messageRoutes = require('./routes/messages');
const sosRoutes = require('./routes/sos');
const villageRoutes = require('./routes/villages');
const weatherRoutes = require('./routes/weather');
const { setupSocketHandlers } = require('./socket/socketHandlers');
const { setIOInstance } = require('./services/alertService');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Rate limiting (relaxed for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
// app.use(limiter); // Disabled for development
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', req.body);
  }
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'VillageVault API'
  });
});

// Dashboard stats endpoint removed - handled by routes/users.js

// Protected routes (after mock endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/weather', weatherRoutes);

// Socket.IO setup
setupSocketHandlers(io);
setIOInstance(io);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  const fs = require('fs');
  
  // Check if frontend build exists
  if (fs.existsSync(frontendPath)) {
    // Serve static files from frontend dist
    app.use(express.static(frontendPath));
    
    // Handle React Router - send all non-API requests to index.html
    app.get('*', (req, res, next) => {
      // Don't handle API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      // Serve index.html for all other routes
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
    
    console.log('✅ Frontend static files served from:', frontendPath);
  } else {
    console.warn('⚠️  Frontend build not found at:', frontendPath);
    console.warn('   API endpoints will still work, but frontend won\'t be served');
  }
}

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 VillageVault API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { io };

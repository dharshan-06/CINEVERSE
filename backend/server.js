require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { decryptSecret } = require('./services/kmsService');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

const startServer = async () => {
  try {
    // Decrypt secrets if they are KMS encrypted
    const mongoUri = await decryptSecret(process.env.MONGODB_URI);
    const tmdbApiKey = await decryptSecret(process.env.TMDB_API_KEY);
    const jwtSecret = await decryptSecret(process.env.JWT_SECRET);

    // Inject back into process.env for easier access in other parts of the app
    process.env.MONGODB_URI = mongoUri;
    process.env.TMDB_API_KEY = tmdbApiKey;
    process.env.JWT_SECRET = jwtSecret;

    // Connect to Database
    await connectDB(mongoUri);

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/movies', require('./routes/movieRoutes'));
    app.use('/api/reviews', require('./routes/reviewRoutes'));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

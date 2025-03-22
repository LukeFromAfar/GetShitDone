const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 4000;

// Fix: Use process.env.FRONTEND_URL and add a fallback
let corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: 'GET, POST, PUT, DELETE',
  optionSuccessStatus: 200
}

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/note', noteRoutes);

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
  console.log("   __ __  ____  ____  ____ \n  / // / / __ \\/ __ \\/ __ \\\n / // /_/ / / / / / / / / /\n/__  __/ /_/ / /_/ / /_/ / \n  /_/  \\____/\\____/\\____/  \n                           ");
});
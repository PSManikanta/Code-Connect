const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const proposalRoutes = require('./routes/proposals');
const emailRoutes = require('./routes/email');

const app = express();

// Middleware
app.use(cors()); // Configure according to your frontend URL in production
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/email', emailRoutes);

// Root endpoint for testing
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Code Connect API is running.' });
});

// Fallback for 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Export the app for Vercel serverless deployment
module.exports = app;

// Listen on a port if running locally
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

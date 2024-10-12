require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Jina Reader URL
const JINA_READER_URL = 'https://r.jina.ai/';

// Function to fetch content from Jina Reader API
const fetchContentFromJina = async (url) => {
  try {
    const response = await axios.get(`${JINA_READER_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      },
    });
    return response.data; // Returning the response content
  } catch (error) {
    console.error('Error fetching content from Jina:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch content from Jina Reader.');
  }
};

// Handle POST request
app.post('/fetch-content', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  try {
    const content = await fetchContentFromJina(url);
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Exporting the app for Vercel
module.exports = app;

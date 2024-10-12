require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Jina Reader endpoints
const JINA_READER_URL = 'https://r.jina.ai/';
const JINA_SEARCH_URL = 'https://s.jina.ai/';

// Function to detect if input is a URL or a query
const isUrl = (input) => {
  try {
    new URL(input);
    return true;
  } catch (e) {
    return false;
  }
};

// Function to fetch content from Jina Reader API
const fetchContentFromJina = async (input) => {
  const url = isUrl(input)
    ? `${JINA_READER_URL}${input}` // If input is a URL
    : `${JINA_SEARCH_URL}${encodeURIComponent(input)}`; // If input is a query

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching content from Jina:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch content from Jina Reader.');
  }
};

// Handle POST request for URL or query
app.post('/fetch-content', async (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Input (URL or query) is required.' });
  }

  try {
    const content = await fetchContentFromJina(input);
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

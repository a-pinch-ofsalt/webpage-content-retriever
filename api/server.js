import express from 'express';
import fetch from 'node-fetch'; // Use dynamic import if needed
import https from 'https';

const app = express();
const port = 3002; // You can change the port if needed

// Jina Reader function
async function jinaReaderStream(query) {
  const agent = new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certificates
  });

  const encodedQuery = encodeURIComponent(query);
  const url = `https://s.jina.ai/${encodedQuery}`;

  const response = await fetch(url, {
    method: 'GET', // Changed to GET
    headers: {
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json',
    },
    agent: agent,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return new Promise((resolve, reject) => {
    let result = '';

    // Collect the data chunks but don't print anything until the stream ends
    response.body.on('data', (chunk) => {
      result += chunk.toString();
    });

    response.body.on('end', () => {
      resolve(result); // Return the full result after streaming is complete
    });

    response.body.on('error', (err) => {
      reject(err); // Handle any errors
    });
  });
}

// API endpoint to handle incoming requests
app.get('/query', async (req, res) => {
  const userQuery = req.query.q; // Get the 'q' parameter from the URL
  if (!userQuery) {
    return res.status(400).send('Query parameter "q" is required.');
  }

  try {
    const result = await jinaReaderStream(userQuery); // Call the Jina Reader function
    res.json({ result }); // Send the result back to the client
  } catch (error) {
    res.status(500).send(`Error processing query: ${error.message}`);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8765;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/command', (req, res) => {
  const { command } = req.body;
  try {
    if (!command) throw new Error('No command provided');
    // Simulate command processing
    console.log(`Processing command: ${command}`);
    res.status(200).json({ message: 'Command processed successfully' });
  } catch (error) {
    console.error('Error processing command:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

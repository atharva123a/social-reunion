require('dotenv').config();

const express = require('express');
import http from 'http';
import { PORT } from './config';
import { initDb } from './db';

const app = express();

const server = http.createServer(app);

// connect to mongoose:

app.get('/', (req, res) => {
  res.send('HOME PAGE');
});

async function initServer() {
  server.listen(PORT, () => {
    console.log(`server is running at https://localhost:${PORT}`);
  });
}

async function initRouter() {
  app.use('/health', (req, res) => res.send('OK!'));
}

export async function init() {
  try {
    console.log('init');

    await initDb();
    initRouter();
    initServer();
  } catch (error) {
    console.log('unable to initialize app: ', error);
  }
}

init();

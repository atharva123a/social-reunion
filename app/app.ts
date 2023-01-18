require('dotenv').config();

const express = require('express');
import http from 'http';
import { PORT } from './config';
import { initDb } from './db';
import { router as userRouter } from './user/userRoutes';
import { router as postsRouter } from './posts/postsRoutes';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
const app = express();

const server = http.createServer(app);

app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(express.json());
app.use(cors());
app.use(morgan('[:date[web]] :method :url :status :response-time ms'));

app.get('/', (req, res) => {
  res.send('Reunion Social Media API');
});

async function initServer() {
  server.listen(PORT, () => {
    console.log(`server is running at https://localhost:${PORT}`);
  });
}

async function initRouter() {
  app.use('/api', userRouter);
  app.use('/api', postsRouter);
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

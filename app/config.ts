import { config } from 'dotenv';

config();
export const { PORT, MONGO_URI, ENV, JWT_SECRET } = process.env;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setChatRoutes } from './routes/chatRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
setChatRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
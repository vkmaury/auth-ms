import express, { Application } from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import { consumer } from './config1/kafka-consume';

dotenv.config();

const app: Application = express();
const PORT: number = 5000;

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoURI: string = 'mongodb+srv://Microservices:Microservices@cluster0.nhb0amm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI).then(() => {
    console.log('MongoDB connected...');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// consumer.on('error', (error) => {
//     console.error('Kafka consumer error:', error);
//   });
// Routes
app.use('/api/v1', userRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

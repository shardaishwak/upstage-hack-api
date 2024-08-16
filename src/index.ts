import mongoose from 'mongoose';
import app from './app';

import dotenv from 'dotenv';
import { logger } from './config/winston';
import amadeus from './config/amadeus';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const PORT = process.env.PORT || 5001;

(async () => {
	try {
		await mongoose.connect(process.env.DATABASE_URI);
		logger.log({
			level: 'info',
			message: `Connected to MongoDB`,
			meta: 'database',
		});

		const server = http.createServer(app);
		const io = new Server(server, {
			cors: {
				origin: process.env.CLIENT_URL || 'http://localhost:3000',
				methods: ['GET', 'POST'],
				credentials: true,
			},
		});

		io.on('connect', (socket) => {
			console.log('New client connected:', socket.id);

			socket.on('message', (message) => {
				console.log('Received message:', message);
				io.emit('message', message); // Broadcast the message to all connected clients
			});

			socket.on('disconnect', () => {
				console.log('Client disconnected:', socket.id);
			});
		});
		// await initializeRedisClient();
		server.listen(PORT, () => {
			logger.log({
				level: 'info',
				message: `Server is running on port ${PORT}`,
				meta: 'express',
			});
		});
	} catch (err: any) {
		logger.log({
			level: 'error',
			message:
				err?.message ||
				'An error occured when initializing the server. Could be due to database, redis or app.',
			meta: 'database',
		});
	}
})();

import mongoose from 'mongoose';
import app from './app';

import dotenv from 'dotenv';
import { logger } from './config/winston';
import amadeus from './config/amadeus';
import { Server } from 'socket.io';
import http from 'http';
import { handleChat, handleChatV2 } from './chat';

dotenv.config();

const PORT = process.env.PORT || 5001;

// temporary cache for faster results
const cache: Map<string, any> = new Map();

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

		io.on('connect', async (socket) => {
			console.log('New client connected:', socket.id);

			// socket for handing chat system
			socket.on('chat', async (message: string) => {
				io.emit('chat:loading', true);

				if (cache.has(message)) {
					io.emit('chat', cache.get(message));
					io.emit('chat:loading', false);
					return;
				}

				// call the chat API system
				const chatResponse = await handleChatV2(message, io);
				cache.set(message, chatResponse);
				io.emit('chat', chatResponse);

				io.emit('chat:loading', false);
			});

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

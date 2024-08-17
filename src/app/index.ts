import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import BodyParser from 'body-parser';
import helmet from 'helmet';
import { logger } from '../config/winston';
import ErrorWithStatus from '../utils/ErrorWithStatus';
import { upstage } from '../config/upstage';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { availableFunctions, tools } from '../tools';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import { handleChat } from '../chat';

dotenv.config();

const app: Application = express();
app.use(helmet());
app.use(
	cors({
		origin: process.env.CLIENT_URL, // blocks all the other routes
		credentials: true,
		methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
		//preflightContinue: false,
	})
);

// TODO: Connect stripe webhook
app.post('/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

app.get('/chat', async (req: Request, res: Response) => {
	const q = req.query.q;
	if (!q) {
		res.status(400).send({ error: 'Query parameter "q" is required' });
		return;
	}

	console.log('Starting chat');
	const response = await handleChat(q as string);
	console.log('Ending chat');
	res.send(response);
});

/**
 * Any error that occurs in the application will be caught here
 */
app.use((err: ErrorWithStatus, req: Request, res: Response, _: NextFunction) => {
	if (res.headersSent) return;

	const status = err.status || 500;
	const message = err.message || 'Something went wrong';

	if (status >= 500) {
		logger.log({
			level: 'error',
			message: `${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}\n${err.stack}`,
			meta: 'express',
		});
	} else {
		logger.log({
			level: 'notice',
			message: `${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
			meta: 'express',
		});
	}

	res.status(status).send({
		error: message,
		status,
		route: req.originalUrl,
	});
});

export default app;

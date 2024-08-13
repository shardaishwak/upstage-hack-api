import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import BodyParser from 'body-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { logger } from '../config/winston';
import ErrorWithStatus from '../utils/ErrorWithStatus';

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
app.post('/webhook', BodyParser.raw({ type: 'application/json' }));

app.use(BodyParser.json());

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

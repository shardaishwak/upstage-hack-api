import mongoose from 'mongoose';
import app from './app';

import dotenv from 'dotenv';
import { logger } from './config/winston';
import amadeus from './config/amadeus';

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
		// await initializeRedisClient();
		app.listen(PORT, () => {
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

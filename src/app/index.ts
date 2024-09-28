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
import multer from 'multer';

import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import stripeRoutes from './routes/stripe';

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { extractPassport } from '../chat';
import { itineraryRouter } from './itinerary/itinerary.router';
import { stripeServices } from './stripe/stripe.service';
import { serpApi } from '../config/serpApi';

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
app.post('/webhook', express.raw({ type: 'application/json' }),stripeServices.handleWebhook);

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/itinerary', itineraryRouter);
app.use('/stripe', stripeRoutes )

(async () => {
	// await handleChatV2('give me a list of events that i can attend in vancouver for children');
})();

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

const translationMessages: ChatCompletionMessageParam[] = [];

const handleTranslationChat = async (q: string, direction: 'koen' | 'enko') => {
	translationMessages.push({
		role: 'user',
		content: q as string,
	});

	console.log(direction);

	const model =
		direction === 'koen' ? 'solar-1-mini-translate-koen' : 'solar-1-mini-translate-enko';
	console.log('model', model);

	const response = await upstage.chat.completions.create({
		model: model,
		messages: translationMessages,
	});

	const responseMessage = response.choices[0]?.message;

	if (responseMessage) {
		translationMessages.push(responseMessage); // Add assistant's response to messages array
		return translationMessages;
	} else {
		throw new Error('Translation failed.');
	}
};

app.get('/translation', async (req: Request, res: Response) => {
	const q = req.query.q;
	const direction = req.query.direction;

	console.log('q', q);

	if (!q) {
		res.status(400).send({ error: 'Query parameter "q" is required' });
		return;
	}

	if (!direction) {
		res.status(400).send({ error: 'Query parameter "direction" is required' });
		return;
	}

	console.log('Starting translation chat');
	const response = await handleTranslationChat(q as string, direction as 'koen' | 'enko');
	console.log('Ending translation chat');
	res.send(response);
});

const extractPassportInfo = (ocrData: any) => {
	const extractedInfo: Record<string, string | boolean> = {};

	const text = ocrData.pages.map((page: any) => page.text).join('\n');
	const lines = text.split('\n').map((line) => line.trim());

	lines.forEach((line, index) => {
		if (line.match(/document type/i)) {
			extractedInfo.documentType = line.split(':').pop()?.trim() || 'PASSPORT';
		} else if (line.match(/passport no|number/i)) {
			extractedInfo.number = line.split(' ').pop() || '';
		} else if (line.match(/surname|nom/i)) {
			extractedInfo.surname = lines[index + 1]?.trim() || '';
		} else if (line.match(/nationality|nationalité/i)) {
			extractedInfo.nationality = lines[index + 1]?.trim() || '';
		} else if (line.match(/date of birth|date de naissance/i)) {
			extractedInfo.dateOfBirth = lines[index + 1]?.trim() || '';
		} else if (line.match(/place of birth|lieu de naissance/i)) {
			extractedInfo.birthPlace = lines[index + 1]?.trim() || '';
		} else if (line.match(/date of issue|date de délivrance/i)) {
			extractedInfo.issuanceDate = lines[index + 1]?.trim() || '';
		} else if (line.match(/date of expiry|date d'expiration/i)) {
			extractedInfo.expiryDate = lines[index + 1]?.trim() || '';
		} else if (line.match(/issuance location|location/i)) {
			extractedInfo.issuanceLocation = lines[index + 1]?.trim() || '';
		} else if (line.match(/issuance country|country/i)) {
			extractedInfo.issuanceCountry = lines[index + 1]?.trim() || '';
		} else if (line.match(/validity country|validity/i)) {
			extractedInfo.validityCountry = lines[index + 1]?.trim() || '';
		} else if (line.match(/holder/i)) {
			extractedInfo.holder = true;
		}
	});

	return extractedInfo;
};

const upload = multer({ dest: 'uploads/' });

app.post('/ocr', upload.single('document'), async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).send({ error: 'No file uploaded' });
		}

		const formData = new FormData();
		formData.append('document', fs.createReadStream(req.file.path));

		const response = await axios.post('https://api.upstage.ai/v1/document-ai/ocr', formData, {
			headers: {
				Authorization: `Bearer ${process.env.UPSTAGE_API_KEY}`,
				'Content-Type': 'multipart/form-data',
			},
			params: {
				model: 'ocr-2.2.1', // or any other version you prefer
			},
		});

		// Clean up the uploaded file
		fs.unlinkSync(req.file.path);

		console.log('response', response.data);
		// Extract passport information
		const passportInfo = extractPassportInfo(response.data);

		console.log('passportInfo', passportInfo);

		res.json(passportInfo); // Send extracted passport info as response
	} catch (error) {
		console.error('OCR error:', error);
		res.status(500).send({ error: 'OCR processing failed' });
	}
});

app.get('/return-flights', async (req: Request, res: Response) => {
	try {
		const { departure_id, arrival_id, departure_token, outbound_date, return_date } =
			req.query as {
				departure_id: string;
				arrival_id: string;
				departure_token: string;
				outbound_date: string;
				return_date: string;
			};

		const flights = await serpApi.getGoogleReturnFlight({
			departure_id,
			arrival_id,
			departure_token,
			outbound_date,
			return_date,
		});

		res.json({ flights });
	} catch (error) {
		console.error('Error:', error);
		res.status(500).send({ error: 'Failed to get return flights' });
	}
});

app.post('/passport', upload.single('document'), async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).send({ error: 'No file uploaded' });
		}

		const formData = new FormData();
		formData.append('document', fs.createReadStream(req.file.path));

		// Upload the File
		let response = await axios.post(
			'https://api.upstage.ai/v1/document-ai/async/document-parse',
			formData,
			{
				headers: {
					Authorization: `Bearer ${process.env.UPSTAGE_API_KEY}`,
					'Content-Type': 'multipart/form-data',
				},
			}
		);

		// Clean up the uploaded file
		fs.unlinkSync(req.file.path);

		const data = response.data;
		const request_id = data.request_id;

		let c = true;

		// Check the status of the file
		while (c) {
			response = await axios.get(
				`https://api.upstage.ai/v1/document-ai/requests/${request_id}`,
				{
					headers: {
						Authorization: `Bearer ${process.env.UPSTAGE_API_KEY}`,
					},
				}
			);
			console.log(response);

			const status = response.data.status;

			if (status === 'completed') {
				c = false;
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		const htmlInfo = response.data?.batches[0]?.download_url;

		// fetch the URL as json
		response = await axios.get(htmlInfo);

		const htmlText = response.data?.html;

		// now take the HTML and use LLM to extract the passport information

		const extractPassportInfo = await extractPassport(htmlText);

		res.json(extractPassportInfo); // Send extracted passport info as response
	} catch (error) {
		console.error('OCR error:', error);
		res.status(500).send({ error: 'OCR processing failed' });
	}
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

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import BodyParser from 'body-parser';
import helmet from 'helmet';
import { logger } from '../config/winston';
import ErrorWithStatus from '../utils/ErrorWithStatus';
import { upstage, upstageOCR } from '../config/upstage';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { availableFunctions, tools } from '../tools';
import dotenv from 'dotenv';
import multer from 'multer';

import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

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

const preferences = [];

const messages: ChatCompletionMessageParam[] = [
	{
		role: 'system',
		content: `Your response to "content" should be a JSON format. It should include the following fields: type: "flight" | "accomodation" | "car_rental" | "activity",. for flight type: have the following properties: from, to, dates, passengers, preferences, price, class, currency, baggage, airline, apirports
			`,
	},
];

const handleChat = async (q: string) => {
	const data = {};

	messages.push({
		role: 'user',
		content: (q as string) + '. Preferences: ' + preferences.join(', '),
	});
	const response = await upstage.chat.completions.create({
		model: 'solar-1-mini-chat',
		messages,
		tools: tools,
	});
	const responseMessage = response.choices[0].message;

	const toolCalls = responseMessage.tool_calls;
	if (toolCalls) {
		console.log('[toolCalls]', toolCalls);
		// Step 3: call the function
		// Note: the JSON response may not always be valid; be sure to handle errors
		messages.push(responseMessage); // extend conversation with assistant's reply
		for (const toolCall of toolCalls) {
			const functionName = toolCall.function.name as keyof typeof availableFunctions;
			const functionToCall = availableFunctions[functionName];
			if (!functionToCall) {
				throw new Error(`Function ${functionName} does not exist`);
			}
			const functionArgs = JSON.parse(toolCall.function.arguments);
			console.log('[functionArgs]', functionArgs);

			let functionResponse = await functionToCall(functionArgs);

			data[functionName] = functionResponse;

			// messages.push({
			// 	tool_call_id: toolCall.id,
			// 	role: 'tool',

			// 	content: JSON.stringify(functionResponse),
			// });
		}
	}
	return data;
};

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

const extractPassportInfo = (ocrData: any) => {
    const extractedInfo: Record<string, string> = {};

    // Flatten all text from OCR response to increase flexibility in pattern matching
    const text = ocrData.pages.map((page: any) => page.text).join('\n');

    // Split the text into lines for more precise processing
    const lines = text.split('\n').map(line => line.trim());

    // Iterate over lines and use context-based extraction
    lines.forEach((line, index) => {
        if (line.includes('Passport No') || line.includes('PP CAN')) {
            extractedInfo.passportNumber = line.split(' ').pop() || '';
        } else if (line.match(/surname|nom/i)) {
            extractedInfo.surname = lines[index + 1]?.trim() || ''; // Surname often follows the label
        } else if (line.match(/given names|prenoms/i)) {
            extractedInfo.givenNames = lines[index + 1]?.trim() || ''; // Given names often follow the label
        } else if (line.match(/nationality|nationalité/i)) {
            extractedInfo.nationality = lines[index + 1]?.trim() || ''; // Nationality often follows the label
        } else if (line.match(/date of birth|date de naissance/i)) {
            extractedInfo.dateOfBirth = lines[index + 1]?.trim() || ''; // DOB often follows the label
        } else if (line.match(/place of birth|lieu de naissance/i)) {
            extractedInfo.placeOfBirth = lines[index + 1]?.trim() || ''; // Place of birth often follows the label
        } else if (line.match(/date of issue|date de délivrance/i)) {
            extractedInfo.dateOfIssue = lines[index + 1]?.trim() || ''; // Date of issue often follows the label
        } else if (line.match(/date of expiry|date d'expiration/i)) {
            extractedInfo.dateOfExpiry = lines[index + 1]?.trim() || ''; // Date of expiry often follows the label
        } else if (line.match(/authority|autorité/i)) {
            extractedInfo.authority = lines[index + 1]?.trim() || ''; // Authority often follows the label
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

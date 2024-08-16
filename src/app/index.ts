import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import BodyParser from 'body-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { logger } from '../config/winston';
import ErrorWithStatus from '../utils/ErrorWithStatus';
import { upstage } from '../config/upstage';
import {
	ChatCompletionCreateParamsBase,
	ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import { availableFunctions, tools } from '../tools';

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

const preferences = ['non-stop', 'direct', 'business'];

const messages: ChatCompletionMessageParam[] = [
	{
		role: 'system',
		content: `Your response to "content" should be a JSON format. It should include the following fields: type: "flight" | "accomodation" | "car_rental" | "activity",. for flight type: have the following properties: from, to, dates, passengers, preferences, price, class, currency, baggage, airline, apirports
			`,
	},
];
const handleChat = async (q: string) => {
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
		// Step 3: call the function
		// Note: the JSON response may not always be valid; be sure to handle errors
		messages.push(responseMessage); // extend conversation with assistant's reply
		for (const toolCall of toolCalls) {
			const functionName = toolCall.function
				.name as (typeof tools)[number]['function']['name'];
			const functionToCall = availableFunctions[functionName];
			if (!functionToCall) {
				throw new Error(`Function ${functionName} does not exist`);
			}
			const functionArgs = JSON.parse(toolCall.function.arguments);
			const functionResponse = await functionToCall(functionArgs);
			console.log(JSON.stringify(functionResponse, null, 2));
			console.log(messages[0]);
			messages.push({
				tool_call_id: toolCall.id,
				role: 'tool',

				content: JSON.stringify(functionResponse),
			}); // extend conversation with function response
		}

		const secondResponse = await upstage.chat.completions.create({
			model: 'solar-1-mini-chat',
			messages: messages,
		}); // get a new response from the model where it can see the function response

		// I Want json format with only few fields inside it

		return secondResponse;
	}
	return response;
};

app.get('/chat', async (req: Request, res: Response) => {
	const q = req.query.q;
	if (!q) {
		res.status(400).send({ error: 'Query parameter "q" is required' });
		return;
	}

	const response = await handleChat(q as string);
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

import { ChatCompletionMessageParam } from 'openai/resources';
import { upstage } from './config/upstage';
import { Server } from 'socket.io';
import { google_tool_functions, google_tools } from './google_tools';

const getBaseInformation = () => {
	const todayDate = new Date().toLocaleDateString('en-CA');

	return `Today is ${todayDate}.`;
};

const generateTitleFromQuery = async (q: string) => {
	// Generate a nice title to show based on what the user searched for
	const response = await upstage.chat.completions.create({
		model: 'solar-pro',
		messages: [
			{
				role: 'user',
				content: `The user entered the particular query. Give a title to show on top of the items. "${q}".`,
			},
		],
	});
	const responseMessage = response.choices[0].message;
	return responseMessage.content;
};

export const handleChatV2 = async (q: string, io?: Server) => {
	const data: { [key: string]: any } = {};
	const preferences: any[] = [];

	const query = `${getBaseInformation()}. For flights, show only 5 results. When showing activities, show at least 15. For activity, field "city" can be also something complex, not just the city. For flights, use type=1 for round flights and type=2 for one-way. This is understood based on whether the user added a return flight or not.
               For events, add the location (place) inside the query as well `;

	const messages: ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: query,
		},
	];

	messages.push({
		role: 'user',
		content:
			(q as string) +
			'. Preferences: ' +
			preferences.join(', ') +
			'. If user added return flight, type=1, otherwise type=2.',
	});
	const response = await upstage.chat.completions.create({
		model: 'solar-1-mini-chat',
		messages,
		tools: google_tools,
	});
	const responseMessage = response.choices[0].message;

	const toolCalls = responseMessage.tool_calls;
	if (toolCalls) {
		console.log('[toolCalls]', toolCalls);

		messages.push(responseMessage);
		for (const toolCall of toolCalls) {
			const functionName = toolCall.function.name as keyof typeof google_tool_functions;
			io?.emit('chat:loading:tool_call', { functionName, loading: true });

			const functionToCall = google_tool_functions[functionName];
			if (!functionToCall) {
				throw new Error(`Function ${functionName} does not exist`);
			}
			const functionArgs = JSON.parse(toolCall.function.arguments);
			console.log('[functionArgs]', functionArgs);

			let functionResponse = await functionToCall(functionArgs);

			io?.emit('chat:loading:tool_call', { functionName, loading: false });

			data[functionName] = functionResponse;

			// messages.push({
			// 	tool_call_id: toolCall.id,
			// 	role: 'tool',

			// 	content: JSON.stringify(functionResponse),
			// });
		}
		console.log('[data]', data);
	}

	const title = await generateTitleFromQuery(q);
	data['title'] = title;
	return data;
};

export const generateItinerary = async (q: string) => {
	const response = await upstage.chat.completions.create({
		model: 'solar-pro',
		messages: [
			{
				role: 'user',
				content: `"${q}". Include the ID`,
			},
		],
	});

	const responseMessage = response.choices[0].message;
	return responseMessage.content;
};

export const extractAdditionalInformation = async (q: string) => {
	// from the given query, extract json value for location, from, to, people, preferences: []

	const query = `
		Extract the location, from, to, people, preferences from the given query "${q}". Give a json formation of the following
		If there is none for that info, return null in the appropriate field.

		toDate should be when the itinerary starts: this can be given by the flight departure date. The toDate should be the date of the return flight.

		The output should be
		{
			departure: string,
			arrival: string
			fromDate: string,
			toDate: string,
			people: number,
			preferences: string[]	
		}
	`;

	const response = await upstage.chat.completions.create({
		model: 'solar-1-mini-chat',
		messages: [
			{
				role: 'system',
				content: query,
			},
		],
	});

	const responseMessage = response.choices[0].message;
	if (!responseMessage?.content) {
		throw new Error('Failed to extract information');
	}
	try {
		const data = JSON.parse(responseMessage.content);
		return data;
	} catch (err) {
		console.log(err);
		return null;
	}
};

export const extractPassport = async (html: string) => {
	console.log(html);
	const query = `
		You are given HTML content that represents the data scraped from a passport. Your job is to parse the data and return the following information in JSON format:
		{
			"passport_number": "string",
			"nationality": "string",
			"date_of_birth": "string",
			"expiration_date": "string",
			"full_name": "string",
			"first_name": "string",
			"last_name": "string",
			"place_of_birth": "string",
			"sex": "string",
			"issuing_country": "string"
			"issuing_date": "string",
			"issuance_location": "string",
		}

		The HTML data is:
		${html}
	`;

	const response = await upstage.chat.completions.create({
		model: 'solar-1-mini-chat',
		messages: [
			{
				role: 'system',
				content: query,
			},
		],
	});

	console.log(response.choices[0].message.content);

	const responseMessage = response.choices[0].message;
	if (!responseMessage?.content) {
		throw new Error('Failed to extract information');
	}

	try {
		const data = JSON.parse(responseMessage.content);
		return data;
	} catch (err) {
		console.log(err);
		return null;
	}
};

export const magicItinerary = async (q: string) => {
	const response = await upstage.chat.completions.create({
		model: 'solar-pro',
		messages: [
			{
				role: 'user',
				content: `"${q}". Include the ID`,
			},
		],
	});

	const responseMessage = response.choices[0].message;
	const content = responseMessage.content;
	if (!content) {
		throw new Error('Failed to generate itinerary');
	}

	console.log(content);

	try {
		const data = JSON.parse(content);
		return data;
	} catch (err) {
		console.log(err);
		return null;
	}
};

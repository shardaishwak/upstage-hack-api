import { ChatCompletionMessageParam } from 'openai/resources';
import { upstage } from './config/upstage';
import { availableFunctions, tools } from './tools';
import { Server, Socket } from 'socket.io';
import { google_tool_functions, google_tools } from './google_tools';

const generateTitleFromQuery = async (q: string) => {
	// Generate a nice title to show based on what the user searched for
	const response = await upstage.chat.completions.create({
		model: 'solar-1-mini-chat',
		messages: [
			{
				role: 'user',
				content: `The user entered the particular query. Give a title to show on top of the items. Nothing fancy. "${q}".`,
			},
		],
	});
	console.log(JSON.stringify(response, null, 2));
	const responseMessage = response.choices[0].message;
	return responseMessage.content;
};

export const handleChatV2 = async (q: string, io?: Server) => {
	const data: { [key: string]: any } = {};
	const preferences: any[] = [];

	const messages: ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: `For flights, show only 5 results. When showing activities, show at least 15. For activity, field "city" can be also something complex, not just the city. For flights, use type=1 for round flights and type=2 for one-way. This is understood based on whether the user added a return flight or not.
               For events, add the location (place) inside the query as well `,
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
		// Step 3: call the function
		// Note: the JSON response may not always be valid; be sure to handle errors
		messages.push(responseMessage); // extend conversation with assistant's reply
		for (const toolCall of toolCalls) {
			const functionName = toolCall.function.name as keyof typeof google_tool_functions;
			io?.emit('chat:loading:tool_call', { functionName, loading: true });

			const functionToCall = google_tool_functions[functionName];
			if (!functionToCall) {
				throw new Error(`Function ${functionName} does not exist`);
			}
			const functionArgs = JSON.parse(toolCall.function.arguments);
			console.log('[functionArgs]', functionArgs);

			// let functionResponse = await functionToCall(functionArgs);

			// io?.emit('chat:loading:tool_call', { functionName, loading: false });

			// data[functionName] = functionResponse;

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

export const handleChat = async (q: string, io?: Server) => {
	const data: { [key: string]: any } = {};
	const preferences: any[] = [];

	const messages: ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: `For flights, show only 5 results. When showing activities, show at least 15. For activity, field "city" can be also something complex, not just the city. For flights, use type=1 for round flights and type=2 for one-way. This is understood based on whether the user added a return flight or not.
                `,
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
			io?.emit('chat:loading:tool_call', { functionName, loading: true });

			const functionToCall = availableFunctions[functionName];
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

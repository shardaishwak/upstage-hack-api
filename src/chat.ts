import { ChatCompletionMessageParam } from 'openai/resources';
import { upstage } from './config/upstage';
import { availableFunctions, tools } from './tools';
import { Server, Socket } from 'socket.io';

const generateTitleFromQuery = async (q: string) => {
	// Generate a nice title to show based on what the user searched for
	const response = await upstage.chat.completions.create({
		model: 'solar-1-mini-chat',
		messages: [
			{
				role: 'user',
				content: `Generate a title for the query that the user searched for. Nothing fancy. "${q}".`,
			},
		],
	});
	console.log(JSON.stringify(response, null, 2));
	const responseMessage = response.choices[0].message;
	return responseMessage.content;
};

export const handleChat = async (q: string, io?: Server) => {
	const data: { [key: string]: any } = {};
	const preferences: any[] = [];

	const messages: ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: `For flights, show only 5 results. When showing activities, show at least 15. For activity, field "city" can be also something complex, not just the city.
                `,
		},
	];

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

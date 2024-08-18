import { ChatCompletionMessageParam } from 'openai/resources';
import { upstage } from './config/upstage';
import { availableFunctions, tools } from './tools';

export const handleChat = async (q: string) => {
	const data: { [key: string]: any } = {};
	const preferences: any[] = [];

	const messages: ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: `For flights, show only 5 results. When showing activities, show at least 15
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

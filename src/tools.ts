import { ChatCompletionTool } from 'openai/resources';
import { flight_search_tool_function } from './tool_calls';

const flight_offer_search: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'flight_offer_search',
		description: 'Returns a list of available flight offers based on search criteria',
		parameters: {
			type: 'object',
			properties: {
				originLocationCode: {
					type: 'string',
					description: 'The IATA code for the origin location',
				},
				destinationLocationCode: {
					type: 'string',
					description: 'The IATA code for the destination location',
				},
				departureDate: {
					type: 'string',
					description: 'The departure date in YYYY-MM-DD format',
				},
				returnDate: {
					type: 'string',
					description: 'The return date in YYYY-MM-DD format, optional',
					optional: true,
				},
				adults: {
					type: 'number',
					description: 'Number of adult passengers',
				},
				children: {
					type: 'number',
					description: 'Number of child passengers, optional',
					optional: true,
				},
				infants: {
					type: 'number',
					description: 'Number of infant passengers, optional',
					optional: true,
				},
				travelClass: {
					type: 'string',
					enum: ['ECONOMY', 'PREMIUS_ECONOMY', 'BUSINESS', 'FIRST'],
					description: 'The class of travel, optional',
					optional: true,
				},
				includedAirlineCodes: {
					type: 'string',
					description:
						'Codes of airlines to include in the search, comma-separated, optional',
					optional: true,
				},
				excludedAirlineCodes: {
					type: 'string',
					description:
						'Codes of airlines to exclude from the search, comma-separated, optional',
					optional: true,
				},
				nonStop: {
					type: 'boolean',
					description: 'Whether to filter for non-stop flights only, optional',
					optional: true,
				},
				currencyCode: {
					type: 'string',
					description: 'Currency code for pricing, optional',
					optional: true,
				},
				maxPrice: {
					type: 'number',
					description: 'Maximum price for tickets, optional',
					optional: true,
				},
				max: {
					type: 'number',
					description: 'Maximum number of offers to return, optional',
					optional: true,
				},
			},
			required: ['originLocationCode', 'destinationLocationCode', 'departureDate', 'adults'],
		},
	},
};

export const tools: ChatCompletionTool[] = [flight_offer_search];
export const availableFunctions = {
	flight_offer_search: flight_search_tool_function,
};

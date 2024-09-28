import { ChatCompletionTool } from 'openai/resources';
import {
	google_events_tool_function,
	google_flight_tool_function,
	google_hotels_tool_function,
	google_places_tool_function,
	google_restaurants_tool_function,
} from './tool_calls';

const flight_offer_search: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'flight_offer_search',
		description:
			'Find flights based on given criteria including departure and arrival locations, dates, and various preferences regarding airlines, stops, and class of service. Use type 1 for round trip and type 2 for one-way',
		parameters: {
			type: 'object',
			properties: {
				departure_id: {
					type: 'string',
					description: 'Departure airport code or location kgmid, optional',
					optional: true,
				},
				arrival_id: {
					type: 'string',
					description: 'Arrival airport code or location kgmid, optional',
					optional: true,
				},
				currency: {
					type: 'string',
					description: 'Currency of the returned prices, default to USD',
					optional: true,
				},
				type: {
					type: 'number',
					enum: [1, 2, 3],
					description:
						'Type of the flights. 1 for Round trip, 2 for One way. If the user does not give a return date, use 2.',
					optional: true,
				},
				outbound_date: {
					type: 'string',
					description: 'Outbound date in YYYY-MM-DD format, optional',
					optional: true,
				},
				return_date: {
					type: 'string',
					description:
						'Return date in YYYY-MM-DD format, required if type is set to 1 (Round trip)',
					optional: true,
				},
				travel_class: {
					type: 'number',
					enum: [1, 2, 3, 4],
					description:
						'Travel class: 1 for Economy, 2 for Premium economy, 3 for Business, 4 for First, default to Economy',
					optional: true,
				},
				adults: {
					type: 'number',
					description: 'Number of adults, default to 1',
					optional: true,
				},
				children: {
					type: 'number',
					description: 'Number of children',
					optional: true,
				},
				bags: {
					type: 'number',
					description: 'Number of carry-on bags,',
					optional: true,
				},
			},
			required: [],
		},
	},
};

const hotel_search: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'hotel_search',
		description:
			'Search for hotels based on given criteria such as location, dates, number of guests, and various preferences like rating, amenities, and price range.',
		parameters: {
			type: 'object',
			properties: {
				q: {
					type: 'string',
					description:
						'Search query or hotel location. (e.g., "hotels in New York" or "resorts in Bali". Always include the location name). Make it also descriptitve',
				},
				gl: {
					type: 'string',
					description: 'Country code (e.g., "US" for United States), optional',
					optional: true,
				},
				check_in_date: {
					type: 'string',
					description: 'Check-in date in YYYY-MM-DD format',
				},
				check_out_date: {
					type: 'string',
					description: 'Check-out date in YYYY-MM-DD format',
				},
				adults: {
					type: 'number',
					description: 'Number of adults',
				},
				children: {
					type: 'number',
					description: 'Number of children, optional',
					optional: true,
				},
				rating: {
					type: 'number',
					description: 'Minimum hotel rating (e.g., 4 for 4-star hotels), optional',
					optional: true,
				},
				amenities: {
					type: 'string',
					description:
						'Comma-separated list of desired amenities (e.g., "pool,gym"), optional',
					optional: true,
				},
				min_price: {
					type: 'number',
					description: 'Minimum price per night, optional',
					optional: true,
				},
				max_price: {
					type: 'number',
					description: 'Maximum price per night, optional',
					optional: true,
				},
				currency: {
					type: 'string',
					description: 'Currency of the returned prices, default is USD, optional',
					optional: true,
				},
				hotel_class: {
					type: 'number',
					description: 'Desired hotel class (e.g., 3 for 3-star hotels), optional',
					optional: true,
				},
				bedrooms: {
					type: 'number',
					description: 'Number of bedrooms, optional',
					optional: true,
				},
				bathrooms: {
					type: 'number',
					description: 'Number of bathrooms, optional',
					optional: true,
				},
			},
			required: ['q', 'check_in_date', 'check_out_date', 'adults'],
		},
	},
};

const restaurant_search: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'restaurant_search',
		description: 'Find restaurants based on a search query and location.',
		parameters: {
			type: 'object',
			properties: {
				q: {
					type: 'string',
					description:
						'Search query (e.g., restaurant name, cuisine type, etc.) including the place name',
				},
				location: {
					type: 'string',
					description: 'Location for the restaurant search (city or specific area)',
				},
			},
			required: ['q', 'location'],
		},
	},
};

const event_search: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'event_search',
		description: 'Find events based on a search query and location.',
		parameters: {
			type: 'object',
			properties: {
				q: {
					type: 'string',
					description:
						'Search query for events (e.g., event name, type of event, etc.) including the place name',
				},
			},
			required: ['q'],
		},
	},
};

const places_search: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'places_search',
		description: 'Find nearby places or activities to do based on a search query.',
		parameters: {
			type: 'object',
			properties: {
				q: {
					type: 'string',
					description:
						'Search query for places or activities (e.g., park, museum, cafe, etc.) including the place name. Give a more detailed descrption so that the serach can understand.',
				},
			},
			required: ['q'],
		},
	},
};

export const google_tools = [
	flight_offer_search,
	hotel_search,
	restaurant_search,
	event_search,
	places_search,
];
export const google_tool_functions = {
	flight_offer_search: google_flight_tool_function,
	hotel_search: google_hotels_tool_function,
	restaurant_search: google_restaurants_tool_function,
	event_search: google_events_tool_function,
	places_search: google_places_tool_function,
};

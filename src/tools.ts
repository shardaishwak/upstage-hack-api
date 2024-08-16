import { ChatCompletionTool } from 'openai/resources';
import {
	activities_to_do_tool_function,
	flight_search_tool_function,
	hotels_availability_tool_function,
	list_hotels_in_city_tool_function,
	point_of_interests_tool_function,
} from './tool_calls';

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

const list_hotels_in_city: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'list_hotels_in_city',
		description:
			'Search for hotels in a particular city based on various parameters. Contains the "hotelId" of each hotel.',
		parameters: {
			type: 'object',
			properties: {
				cityCode: {
					type: 'string',
					description:
						'The code of the city where the search is conducted. In IATA format',
				},
				radius: {
					type: 'number',
					description: 'The search radius around the city, optional',
					optional: true,
				},
				radiusUnit: {
					type: 'string',
					enum: ['KM', 'MILE'],
					description: 'The unit of measurement for the radius',
					optional: true,
				},
				chainCodes: {
					type: 'array',
					items: {
						type: 'string',
					},
					description: 'List of hotel chain codes to filter the search, optional',
					optional: true,
				},
				amenities: {
					type: 'array',
					items: {
						type: 'string',
						enum: [
							'SWIMMING_POOL',
							'SPA',
							'FITNESS_CENTER',
							'AIR_CONDITIONING',
							'RESTAURANT',
							'PARKING',
							'PETS_ALLOWED',
							'AIRPORT_SHUTTLE',
							'BUSINESS_CENTER',
							'DISABLED_FACILITIES',
							'WIFI',
							'MEETING_ROOMS',
							'NO_KID_ALLOWED',
							'TENNIS',
							'GOLF',
							'KITCHEN',
							'ANIMAL_WATCHING',
							'BABY-SITTING',
							'BEACH',
							'CASINO',
							'JACUZZI',
							'SAUNA',
							'SOLARIUM',
							'MASSAGE',
							'VALET_PARKING',
							'BAR',
							'LOUNGE',
							'KIDS_WELCOME',
							'NO_PORN_FILMS',
							'MINIBAR',
							'TELEVISION',
							'WI-FI_IN_ROOM',
							'ROOM_SERVICE',
							'GUARDED_PARKG',
							'SERV_SPEC_MENU',
						],
					},
					description:
						'List of amenities to filter the search. If no amenities are specified, keep it empty',
					optional: true,
				},
				ratings: {
					type: 'number',
					enum: [1, 2, 3, 4, 5],
					description: "Filter for the hotel's star rating",
					optional: true,
				},
			},
			required: ['cityCode'],
		},
	},
};

const hotels_availability: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'hotels_availability',
		description:
			'Search the availability of hotels by hotel ID from the list_hotels_in_city API, based on criteria such as check-in and check-out dates, and other filters to determine which hotels are available.',
		parameters: {
			type: 'object',
			properties: {
				hotelIds: {
					type: 'array',
					items: {
						type: 'string',
					},
					description:
						'Array of hotelIds to check availability for. This comes from list_hotels_in_city',
				},
				adults: {
					type: 'number',
					description: 'Number of adults, optional',
					optional: true,
				},
				checkInDate: {
					type: 'string',
					description: 'Check-in date in YYYY-MM-DD format, optional',
					optional: true,
				},
				checkOutDate: {
					type: 'string',
					description: 'Check-out date in YYYY-MM-DD format, optional',
					optional: true,
				},
				countryOfResidence: {
					type: 'string',
					description: 'Country of residence of the guest, optional',
					optional: true,
				},
				roomQuantity: {
					type: 'number',
					description: 'Number of rooms required, optional',
					optional: true,
				},
				priceRange: {
					type: 'string',
					description: 'Desired price range, optional',
					optional: true,
				},
				currency: {
					type: 'string',
					description: 'Currency code, optional',
					optional: true,
				},
				paymentPolicy: {
					type: 'string',
					enum: ['GUARANTEE', 'DEPOSIT', 'NONE'],
					description: 'Payment policy preference, optional',
					optional: true,
				},
				boardType: {
					type: 'string',
					enum: ['ROOM_ONLY', 'BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE'],
					description: 'Type of board included with the room',
				},
			},
			required: ['hotelIds', 'boardType'],
		},
	},
};

const activities_to_do: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'activities_to_do',
		description:
			'List of interesting things to do in the city, based on the specified radius around the city center',
		parameters: {
			type: 'object',
			properties: {
				cityName: {
					type: 'string',
					description:
						'The name of the city where the points of interest are being searched',
				},
				radius: {
					type: 'number',
					description:
						'The search radius from the city center in kilometers, specifying how far the search should extend',
				},
			},
			required: ['cityName', 'radius'],
		},
	},
};

const point_of_interest: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'point_of_interests',
		description:
			'Fetch data for restaurants, shopping areas, sightseeing spots, and more based on the category provided. This function helps to discover points of interest within a specified radius of a city center.',
		parameters: {
			type: 'object',
			properties: {
				cityName: {
					type: 'string',
					description:
						'The name of the city where the points of interest are being searched',
				},
				radius: {
					type: 'number',
					description:
						'The search radius from the city center in kilometers, specifying how far the search should extend',
				},
				categories: {
					type: 'array',
					enum: ['SIGHTS', 'NIGHTLIFE', 'RESTAURANT', 'SHOPPING'],
					description:
						'The list of categories of interest to search for, such as sights, nightlife, restaurants, or shopping',
				},
			},
			required: ['cityName', 'radius', 'categories'],
		},
	},
};

export const tools: ChatCompletionTool[] = [
	flight_offer_search,
	list_hotels_in_city,
	hotels_availability,
	activities_to_do,
	point_of_interest,
];
export const availableFunctions = {
	flight_offer_search: flight_search_tool_function,
	list_hotels_in_city: list_hotels_in_city_tool_function,
	hotels_availability: hotels_availability_tool_function,
	activities_to_do: activities_to_do_tool_function,
	point_of_interests: point_of_interests_tool_function,
};

import axios from 'axios';

export interface GoogleFlightData {
	best_flights: {
		id: string;
		flights: {
			departure_airport: { name: string; id: string; time: string };
			arrival_airport: { name: string; id: string; time: string };
			duration: number;
			airplane: string;
			airline: string;
			airline_logo: string;
			travel_class: string;
			flight_number: string;
			extensions: string[];
			ticket_also_sold_by: string[];
			legroom: string;
			overnight: boolean;
			often_delayed_by_over_30_min: boolean;
		}[];
		layovers: {
			duration: number;
			name: string;
			id: string;
			overnight: boolean;
		}[];
		total_duration: number;
		carbon_emissions: {
			this_flight: number;
			typical_for_this_route: number;
			difference_percent: number;
		};
		price: number;
		type: string;
		airline_logo: string;
		extensions: string[];
		departure_token: string;
		booking_token: string;
	}[];
	other_flights?: GoogleFlightData['best_flights'];
	price_insights?: {
		lowest_price: number;
		price_level: string;
		typical_price_range: [number, number];
		price_history: [number, number][];
	};
	airports: {
		departure: {
			airport: { name: string; id: string };
			city: string;
			country: string;
			country_code: string;
			image: string;
			thumbnail: string;
		}[];
		arrival: {
			airport: { name: string; id: string };
			city: string;
			country: string;
			country_code: string;
			image: string;
			thumbnail: string;
		}[];
	}[];
}

export const departureFlightCache = new Map<string, any>();

export const generateGoogleFlightID = (data: GoogleFlightData['best_flights'][number]) => {
	const flightIds = data.flights.map((flight) => flight.airline + flight.flight_number);

	return flightIds.join('_');
};

export const getGoogleFlights = async (params: any): Promise<GoogleFlightData | null> => {
	try {
		const response: any = await axios.get(
			'https://serpapi.com/search.json?engine=google_flights',
			{
				params: {
					...params,
					api_key: process.env.SERPAPI_ACCESS_TOKEN,
				},
			}
		);

		// insert the ID into the data
		response.data?.best_flights?.forEach((flight: any) => {
			flight.id = generateGoogleFlightID(flight);
		});

		response.data.other_flights?.forEach((flight: any) => {
			flight.id = generateGoogleFlightID(flight);
		});

		// cache all best flights and other flights
		response.data.best_flights?.forEach((flight: any) => {
			departureFlightCache.set(flight.id, flight);
		});

		response.data.other_flights?.forEach((flight: any) => {
			departureFlightCache.set(flight.id, flight);
		});

		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const minimizeFlightData = (flight: GoogleFlightData['best_flights'][number]) => {
	// format ID: 1, departure
	return {
		id: flight.id,
		departure_airport: flight.flights[0].departure_airport.id,
		arrival_airport: flight.flights[flight.flights.length - 1].arrival_airport.id,
		layoverDuration: flight.layovers.reduce((acc, layover) => acc + layover.duration, 0),
	};
};

export const getCachedGoogleFlight = (id: string) => {
	return departureFlightCache.get(id);
};

export const setCachedGoogleFlight = (id: string, data: any) => {
	departureFlightCache.set(id, data);
};

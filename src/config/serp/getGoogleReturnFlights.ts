import axios from 'axios';
import {
	generateGoogleFlightID,
	GoogleFlightData,
	setCachedGoogleFlight,
} from './getGoogleFlights';

export const getGoogleReturnFlight = async (params: {
	departure_id: string;
	arrival_id: string;
	outbound_date: string;
	return_date: string;
	departure_token: string;
}): Promise<GoogleFlightData | null> => {
	try {
		const response = await axios.get('https://serpapi.com/search.json?engine=google_flights', {
			params: {
				...params,
				api_key: process.env.SERPAPI_ACCESS_TOKEN,
			},
		});

		response.data.best_flights.forEach((flight: any) => {
			flight.id = generateGoogleFlightID(flight);
		});

		response.data.other_flights?.forEach((flight: any) => {
			flight.id = generateGoogleFlightID(flight);
		});

		response.data.best_flights.forEach((flight: any) => {
			setCachedGoogleFlight(flight.id, flight);
		});

		response.data.other_flights?.forEach((flight: any) => {
			setCachedGoogleFlight(flight.id, flight);
		});

		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

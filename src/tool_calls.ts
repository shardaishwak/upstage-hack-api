import axios from 'axios';
import amadeus, { customAmadeus } from './config/amadeus';
import { Mapbox } from './lib/mapbox';
import { MapUtilities } from './lib/mapUtilities';
import { serpApi } from './config/serpApi';

const mapUtilities = new MapUtilities(process.env.GEOLOCATION_API_KEY);
const mapbox = new Mapbox(process.env.MAPBOX_PUBLIC_KEY, process.env.GEOLOCATION_API_KEY);

export const flight_search_tool_function = async (params: any) => {
	try {
		const response = await amadeus.shopping.flightOffersSearch.get(params);
		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const list_hotels_in_city_tool_function = async (params: any) => {
	try {
		const response = await customAmadeus.listHotelsInCity(params);

		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const hotels_availability_tool_function = async (params: any) => {
	try {
		const response = await customAmadeus.searchHotels(params);
		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const activities_to_do_tool_function = async (params: any) => {
	try {
		const response = await customAmadeus.getActivitiesToDo(params);
		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const point_of_interests_tool_function = async (params: any) => {
	try {
		// const response = await customAmadeus.getPointsOfInterest(params);
		const response = await mapbox.getCategorySearch(params);
		return response;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

// ================== SERP API ==================

export const google_flight_tool_function = async (params: any) => {
	try {
		const flights = await serpApi.getGoogleFlights(params);

		return flights;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const google_flight_return_tool_function = async (params: {
	departure_id: string;
	arrival_id: string;
	outbound_date: string;
	return_date: string;
	departure_token: string;
}) => {
	try {
		return await serpApi.getGoogleReturnFlight(params);
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const google_hotels_tool_function = async (params: any) => {
	try {
		return await serpApi.getGoogleHotels(params);
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const google_events_tool_function = async (params: any) => {
	try {
		return await serpApi.getGoogleEvents(params);
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const google_restaurants_tool_function = async (params: any) => {
	try {
		return await serpApi.getGoogleFood(params);
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

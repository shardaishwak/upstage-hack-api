import axios from 'axios';
import amadeus, { customAmadeus } from './config/amadeus';
import { Mapbox } from './lib/mapbox';
import { MapUtilities } from './lib/mapUtilities';

const mapUtilities = new MapUtilities(process.env.GEOLOCATION_API_KEY);
const mapbox = new Mapbox(process.env.MAPBOX_PUBLIC_KEY, process.env.GEOLOCATION_API_KEY);

export const flight_search_tool_function = async (params: any) => {
	try {
		const response = await amadeus.shopping.flightOffersSearch.get(params);
		return response.data;
	} catch (err) {
		console.log(err?.response?.data);
		return null;
	}
};

export const google_flight_tool_function = async (params: any) => {
	try {
		const response = await axios.get('https://serpapi.com/search.json?engine=google_flights', {
			params: {
				...params,
				api_key: process.env.SERPAPI_ACCESS_TOKEN,
			},
		});

		console.log(response.data);

		return response.data;
	} catch (err) {
		console.log(err?.response?.data);
		return null;
	}
};

export const list_hotels_in_city_tool_function = async (params: any) => {
	try {
		const response = await customAmadeus.listHotelsInCity(params);

		return response.data;
	} catch (err) {
		console.log(err?.response?.data);
		return null;
	}
};

export const hotels_availability_tool_function = async (params: any) => {
	try {
		const response = await customAmadeus.searchHotels(params);
		return response.data;
	} catch (err) {
		console.log(err?.response?.data);
		return null;
	}
};

export const activities_to_do_tool_function = async (params: any) => {
	try {
		const response = await customAmadeus.getActivitiesToDo(params);
		return response.data;
	} catch (err) {
		console.log(err?.response?.data);
		return null;
	}
};

export const point_of_interests_tool_function = async (params: any) => {
	try {
		// const response = await customAmadeus.getPointsOfInterest(params);
		const response = await mapbox.getCategorySearch(params);
		return response;
	} catch (err) {
		console.log(err?.response?.data);
		return null;
	}
};

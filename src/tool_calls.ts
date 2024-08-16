import amadeus, { customAmadeus } from './config/amadeus';
import { MapUtilities } from './lib/mapUtilities';

const mapUtilities = new MapUtilities(process.env.GEOLOCATION_API_KEY);

export const flight_search_tool_function = async (params: any) => {
	try {
		const response = await amadeus.shopping.flightOffersSearch.get(params);
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
		const response = await customAmadeus.getPointsOfInterest(params);
		return response.data;
	} catch (err) {
		console.log(err?.response?.data);
		return null;
	}
};

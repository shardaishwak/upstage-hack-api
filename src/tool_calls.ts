import amadeus from './config/amadeus';

export const flight_search_tool_function = async (params: any) => {
	try {
		const response = await amadeus.shopping.flightOffersSearch.get(params);
		return response.data;
	} catch (err) {
		console.log(err);
		return null;
	}
};

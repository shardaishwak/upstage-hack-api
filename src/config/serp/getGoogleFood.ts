import axios from 'axios';

export const googleFoodCache = new Map<string, GoogleFoodResult>();

export interface GoogleFoodResult {
	title: string;
	rating: number;
	reviews_original: string;
	reviews: number;
	price: string;
	type: string;
	distance: string;
	address: string;
	hours: string;
	delivery_time: string;
	delivery_fee: string;
	restaurant_id: string;
	images: string[];
	links: {
		order?: string;
		phone?: string;
		directions?: string;
		website?: string;
	};
}

interface GoogleFoodResponse {
	search_metadata: {
		id: string;
		status: string;
		json_endpoint: string;
		created_at: string;
		processed_at: string;
		google_food_url: string;
		raw_html_file: string;
		total_time_taken: number;
	};
	search_parameters: {
		engine: string;
		q: string;
		order_type: number;
		hl: string;
		gl: string;
		lat: string;
		lng: string;
	};
	search_information: {
		local_results_state: string;
	};
	local_results: GoogleFoodResult[];
	serpapi_pagination: {
		next_page_token: string;
		next: string;
	};
}

export const getGoogleFood = async (params: {
	q: string;
	location: string;
}): Promise<GoogleFoodResponse | null> => {
	try {
		const response = await axios.get('https://serpapi.com/search.json?engine=google_food', {
			params: {
				...params,
				api_key: process.env.SERPAPI_ACCESS_TOKEN,
			},
		});

		//cache
		response.data.local_results.forEach((result: GoogleFoodResult) => {
			googleFoodCache.set(result.restaurant_id, result);
		});

		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
};

export const minimizeGoogleFood = (data: GoogleFoodResult) => {
	const { title, rating, address, restaurant_id } = data;

	return {
		restaurant_id,
		title,
		rating,
		address,
	};
};

export const getGoogleCachedFood = (restaurant_id: string): GoogleFoodResult | undefined => {
	return googleFoodCache.get(restaurant_id);
};

import axios from 'axios';

export const googlePlacesCache = new Map<string, any>();

// we will be extracting: top_sights -> sights or local_results -> places or shopping_results

// Query: what are the tourist attractions in jeju island to visit?
// Query: Places to visit in Jeju Island

// Use feedback loops so that if one query does not work, we use another one.

export interface GooglePlacesResult {
	search_metadata: {
		id: string;
		status: string;
		json_endpoint: string;
		created_at: string;
		processed_at: string;
		google_url: string;
		raw_html_file: string;
		total_time_taken: number;
	};
	search_parameters: {
		engine: string;
		q: string;
		location_requested: string;
		location_used: string;
		google_domain: string;
		hl: string;
		gl: string;
		device: string;
	};
	search_information: {
		query_displayed: string;
		total_results: number;
		time_taken_displayed: number;
		organic_results_state: string;
	};
	top_sights: {
		sights: {
			title: string;
			description: string;
			rating: number;
			reviews: number;
			price?: string;
			extracted_price?: number;
			thumbnail: string;
		}[];
	};
	local_results: {
		places: {
			position: number;
			rating: number;
			reviews_original: string;
			reviews: number;
			description: string;
			lsig: string;
			thumbnail: string;
			title: string;
			type: string;
			phone?: string;
			address: string;
			hours: string;
			place_id: string;
			place_id_search: string;
			gps_coordinates: {
				latitude: number;
				longitude: number;
			};
		}[];
		more_locations_link: string;
	};
	shopping_results: {
		price: string;
		extracted_price: number;
		block: string;
		link: string;
		position: number;
		rating: number;
		reviews: number;
		source: string;
		thumbnail: string;
		title: string;
		extensions: string[];
	}[];
	knowledge_graph?: {
		title: string;
		type: string;
		entity_type: string;
		kgmid: string;
		knowledge_graph_search_link: string;
		serpapi_knowledge_graph_search_link: string;
		image: string;
		description: string;
		source: { name: string; link: string };
		max_length: string;
		max_width: string;
		weather: string;
		weather_links: { text: string; link: string }[];
		area: string;
		coordinates: string;
		hangul: string;
		hanja: string;
	};
	related_questions?: {
		question: string;
		snippet: string;
		title: string;
		link: string;
		displayed_link: string;
		thumbnail?: string;
		source_logo?: string;
		next_page_token?: string;
		serpapi_link: string;
	}[];
	organic_results?: {
		position: number;
		title: string;
		link: string;
		redirect_link?: string;
		displayed_link: string;
		thumbnail?: string;
		favicon?: string;
		snippet: string;
		snippet_highlighted_words: string[];
		sitelinks?: { inline: { title: string; link: string }[] };
		source?: string;
	}[];
}

export const minimizeGoogleTopSights = (sight: GooglePlacesResult['top_sights']['sights'][0]) => {
	return {
		title: sight.title,
		rating: sight.rating,
		price: sight.price,
	};
};

export const minimizeGoogleLocalResults = (
	place: GooglePlacesResult['local_results']['places'][0]
) => {
	return {
		title: place.title,
		rating: place.rating,
		hours: place.hours,
		gps_coordinates: place.gps_coordinates,
		address: place.address,
	};
};

export const minimizeGoogleShoppingResults = (place: GooglePlacesResult['shopping_results'][0]) => {
	return {
		title: place.title,
		price: place.price,
	};
};

export default async function getGooglePlaces(params: {
	q: string;
}): Promise<GooglePlacesResult | null> {
	try {
		const response = await axios.get('https://serpapi.com/search.json?engine=google', {
			params: {
				...params,
				api_key: process.env.SERPAPI_ACCESS_TOKEN,
			},
		});

		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
}

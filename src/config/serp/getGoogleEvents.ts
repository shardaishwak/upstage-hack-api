import axios from 'axios';

export const cache = new Map<string, GoogleEventsResult['events_results'][number]>();

export interface GoogleEventsResult {
	search_metadata: {
		id: string;
		status: string;
		json_endpoint: string;
		created_at: string;
		processed_at: string;
		google_events_url: string;
		raw_html_file: string;
		total_time_taken: number;
	};
	search_parameters: {
		q: string;
		engine: string;
		hl: string;
		gl: string;
	};
	search_information: {
		events_results_state: string;
	};
	events_results: {
		title: string;
		date: {
			start_date: string;
			when: string;
		};
		address: string[];
		link: string;
		event_location_map: {
			image: string;
			link: string;
			serpapi_link: string;
		};
		description: string;
		ticket_info: {
			source: string;
			link: string;
			link_type: string;
		}[];
		thumbnail: string;
		venue?: {
			name: string;
			rating: number;
			reviews: number;
			link: string;
		};
		image?: string;
	}[];
	serpapi_pagination: {
		next_page_token: string;
		next: string;
	};
}

// Events in Vancouver
export default async function getGoogleEvents(params: {
	q: string;
}): Promise<GoogleEventsResult | null> {
	try {
		const response = await axios.get('https://serpapi.com/search.json?engine=google_events', {
			params: {
				...params,
				api_key: process.env.SERPAPI_ACCESS_TOKEN,
			},
		});

		// add to cache for later use
		response.data.events_results?.forEach((event: any) => {
			cache.set(event.title, event);
		});

		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
}

export const minimizeGoogleEvents = (events: GoogleEventsResult['events_results']) => {
	return events.map((event) => {
		return {
			title: event.title,
			address: event.address,
			description: event.description,
		};
	});
};

export const getGoogleCachedEvent = (
	title: string
): GoogleEventsResult['events_results'][number] | undefined => {
	return cache.get(title);
};

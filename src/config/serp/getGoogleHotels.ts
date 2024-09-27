import axios from 'axios';

export const googleHotelsCache = new Map<string, GoogleHotelProperty>();

export type GoogleHotelsParams = {
	q: string;
	gl?: string; // country code
	check_in_date: string;
	check_out_date: string;
	adults: number;
	children?: number;
	rating?: number;
	amenities?: string;
	min_price?: number;
	max_price?: number;
	currency?: string;
	hotel_class?: number;
	bedrooms?: number;
	bathrooms?: number;
};

interface GoogleHotelProperty {
	type: string; // Type of property (e.g. hotel or vacation rental)
	name: string; // Name of the property
	description: string; // Description of the property
	link: string; // URL of the property's website
	logo: string; // URL of the property's logo
	sponsored: boolean; // Indicates if the property result is sponsored
	eco_certified: boolean; // Indicates if the property is Eco-certified
	gps_coordinates: {
		latitude: number; // Latitude of the GPS Coordinates
		longitude: number; // Longitude of the GPS Coordinates
	};
	check_in_time: string; // Check-in time of the property (e.g. 3:00 PM)
	check_out_time: string; // Check-out time of the property (e.g. 12:00 PM)
	rate_per_night: {
		lowest: string; // Lowest rate per night formatted with currency
		extracted_lowest: number; // Extracted lowest rate per night
		before_taxes_fees: string; // Rate per night before taxes and fees formatted with currency
		extracted_before_taxes_fees: number; // Extracted rate per night before taxes and fees
	};
	total_rate: {
		lowest: string; // Lowest total rate for the entire trip formatted with currency
		extracted_lowest: number; // Extracted lowest total rate for the entire trip
		before_taxes_fees: string; // Total rate before taxes and fees for the entire trip formatted with currency
		extracted_before_taxes_fees: number; // Extracted total rate before taxes and fees for the entire trip
	};
	prices: {
		source: string; // Source of the site that lists the price
		logo: string; // URL of the source's logo
		rate_per_night: {
			lowest: string; // Lowest rate per night formatted with currency
			extracted_lowest: number; // Extracted lowest rate per night
			before_taxes_fees: string; // Rate per night before taxes and fees formatted with currency
			extracted_before_taxes_fees: number; // Extracted rate per night before taxes and fees
		};
	}[];
	nearby_places: {
		name: string;
		transportations: {
			type: string;
			duration: string;
		}[];
	}[];
	hotel_class: string;
	extracted_hotel_class: number;
	images: {
		thumbnail: string;
		original_image: string;
	}[];
	overall_rating: number;
	reviews: number;
	ratings: {
		stars: number;
		count: number;
	}[];
	location_rating: number;
	reviews_breakdown: {
		name: string;
		description: string;
		total_mentioned: number;
		positive: number;
		negative: number;
		neutral: number;
	}[];
	amenities: string[];
	excluded_amenities: string[];
	essential_info: string[];
	property_token: string;
	serpapi_property_details_link: string;
}

interface GoogleHotels {
	brands: {
		id: number;
		name: string;
		children?: {
			id: number;
			name: string;
		}[];
	}[];
	properties: GoogleHotelProperty[];
	serpapi_pagination: {
		current_from: number;
		current_to: number;
		next_page_token: string;
		next: string;
	};
}

export default async function getGoogleHotels(
	params: GoogleHotelsParams
): Promise<GoogleHotels | null> {
	try {
		const response = await axios.get('https://serpapi.com/search.json?engine=google_hotels', {
			params: {
				...params,
				api_key: process.env.SERPAPI_ACCESS_TOKEN,
			},
		});

		// cache
		response.data.properties.forEach((property: GoogleHotelProperty) => {
			googleHotelsCache.set(property.property_token, property);
		});

		return response.data;
	} catch (err: any) {
		console.log(err?.response?.data);
		return null;
	}
}

export const minimizeGoogleHotel = (data: GoogleHotelProperty) => {
	const { name, overall_rating, check_in_time, check_out_time, property_token } = data;

	return {
		name,
		overall_rating,
		property_token,
		check_in_time,
		check_out_time,
	};
};

export function getGoogleCachedHotel(property_token: string): GoogleHotelProperty | undefined {
	return googleHotelsCache.get(property_token);
}

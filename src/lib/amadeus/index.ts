import axios from 'axios';
import { MapUtilities } from '../mapUtilities';

// - Booking guidance:
// https://developers.amadeus.com/blog/flight-booking-app-angular-1

// - Price confirmation guidance (since price might flactuate):
// https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-price

// Get flight orders
//https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search/api-reference

// - Book a flight
// https://developers.amadeus.com/self-service/category/flights/api-doc/flight-create-orders/api-reference

// - Get the information about a flight order
// https://developers.amadeus.com/self-service/category/flights/api-doc/flight-order-management/api-reference

// - Delete a reservation
// https://developers.amadeus.com/self-service/category/flights/api-doc/flight-order-management/api-reference

// ===================== RESTAURANT AND ATTRACTIONS/ACTIVITIES =====================

// - Get activities to do in a place:
// https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/tours-and-activities/api-reference

// - Point of interests (restuarantes and stuff):
// https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/points-of-interest/api-reference

// ===================== HOTELS =====================
// https://developers.amadeus.com/self-service/category/hotels/api-doc/hotel-list

// Get list of hotels

// Get price confirmation

// Book the hotel

// ===================== CAR TRANSFERS =====================
// https://developers.amadeus.com/self-service/category/cars-and-transfers/api-doc/transfer-booking/api-reference
type FlightOfferParams = {
	originLocationCode: string;
	destinationLocationCode: string;
	departureDate: string;
	returnDate: string;
	adults: number;
	children?: number;
	infants?: number;
	travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
	nonStop?: boolean;
	max?: number;
	maxPrice?: number;
	currencyCode?: string;
};

export type HotelsListParams = {
	cityCode: string;
	radius?: number;
	radiusUnit: 'KM' | 'MILE';
	chainCodes?: string[];
	amenities: Ammenities[];
	ratings: 1 | 2 | 3 | 4 | 5;
};

enum Ammenities {
	SWIMMING_POOL,
	SPA,
	FITNESS_CENTER,
	AIR_CONDITIONING,
	RESTAURANT,
	PARKING,
	PETS_ALLOWED,
	AIRPORT_SHUTTLE,
	BUSINESS_CENTER,
	DISABLED_FACILITIES,
	WIFI,
	MEETING_ROOMS,
	NO_KID_ALLOWED,
	TENNIS,
	GOLF,
	KITCHEN,
	ANIMAL_WATCHING,
	'BABY-SITTING',
	BEACH,
	CASINO,
	JACUZZI,
	SAUNA,
	SOLARIUM,
	MASSAGE,
	VALET_PARKING,
	BAR,
	LOUNGE,
	KIDS_WELCOME,
	NO_PORN_FILMS,
	MINIBAR,
	TELEVISION,
	'WI-FI_IN_ROOM',
	ROOM_SERVICE,
	GUARDED_PARKG,
	SERV_SPEC_MENU,
}

export type HotelsSearchParams = {
	hotelIds: string[];
	adults?: number;
	checkInDate?: string;
	checkOutDate?: string;
	countryOfResidence?: string;
	roomQuantity?: number;
	priceRange?: string;
	currency?: string;
	paymentPolicy?: 'GUARANTEE' | 'DEPOSIT' | 'NONE';
	boardType: 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD' | 'FULL_BOARD' | 'ALL_INCLUSIVE';
};

export enum PointOfInterestCategories {
	SIGHTS,
	NIGHTLIFE,
	RESTAURANT,
	SHOPPING,
}

/**
 * TODO: Generate the parametrs through Chat AI: will make it easy. User writes: we want to go HERE on THIS, we are in XX ... and the AI will generate the parameters
 */
export class CustomAmadeus {
	private BASE_URL_v2 = 'https://test.api.amadeus.com/v2';
	private BASE_URL = 'https://test.api.amadeus.com/v1';
	private BASE_URL_v3 = 'https://test.api.amadeus.com/v3';
	private client_id: string;
	private client_secret: string;
	private access_token: string;
	private token_type: string;

	constructor(client_id: string, client_secret: string) {
		this.client_id = client_id;
		this.client_secret = client_secret;
		this.access_token = '';
		this.token_type = '';
	}

	private getAuthorizationHeader() {
		return `${this.token_type} ${this.access_token}`;
	}

	private async fetchToken() {
		const body = {
			grant_type: 'client_credentials',
			client_id: this.client_id,
			client_secret: this.client_secret,
		};
		const response = await axios('https://test.api.amadeus.com/v1/security/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			data: body,
		});
		this.access_token = response.data.access_token;
		this.token_type = response.data.token_type;
	}

	private async request(endpoint: string, method?: 'GET' | 'POST', params?: any, data?: any) {
		await this.fetchToken();
		const url = `${this.BASE_URL}${endpoint}`;
		const headers = {
			Authorization: this.getAuthorizationHeader(),
		};
		const options = {
			method: method || 'GET',
			headers,
			body: JSON.stringify(data),
			params,
		};
		const response = await axios(url, options);

		return response.data;
	}

	private async request_v2(endpoint: string, method?: 'GET' | 'POST', params?: any, data?: any) {
		await this.fetchToken();
		const url = `${this.BASE_URL_v2}${endpoint}`;
		const headers = {
			Authorization: this.getAuthorizationHeader(),
		};
		const options = {
			method: method || 'GET',
			headers,
			body: JSON.stringify(data),
			params,
		};
		const response = await axios(url, options);
		return response.data;
	}

	private async request_v3(endpoint: string, method?: 'GET' | 'POST', params?: any, data?: any) {
		await this.fetchToken();
		const url = `${this.BASE_URL_v3}${endpoint}`;
		const headers = {
			Authorization: this.getAuthorizationHeader(),
		};
		const options = {
			method: method || 'GET',
			headers,
			body: JSON.stringify(data),
			params,
		};
		const response = await axios(url, options);
		return response.data;
	}

	// ===================== FLIGHTS =====================

	// - Booking guidance:
	// https://developers.amadeus.com/blog/flight-booking-app-angular-1

	// - Price confirmation guidance (since price might flactuate):
	// https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-price

	// Get flight orders
	//https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search/api-reference

	public getFlightOffers(params: FlightOfferParams) {
		return this.request('/shopping/flight-offers', 'GET', params);
	}

	// - Book a flight
	// https://developers.amadeus.com/self-service/category/flights/api-doc/flight-create-orders/api-reference
	public bookFlightOrder(params: any) {
		return this.request_v2('/booking/flight-orders', 'POST', null, params);
	}

	public async getActivitiesToDo(params: { cityName: string; radius: number }) {
		const [lon, lat] = await new MapUtilities(process.env.GEOLOCATION_API_KEY).getCoordinates(
			params.cityName
		);
		return this.request('/shopping/activities', 'GET', {
			longitude: lon,
			latitude: lat,
			radius: params.radius,
		});
	}

	public async getPointsOfInterest(params: {
		cityName: string;
		radius: number;
		category: PointOfInterestCategories;
	}) {
		const [lon, lat] = await new MapUtilities(process.env.GEOLOCATION_API_KEY).getCoordinates(
			params.cityName
		);
		return this.request('/shopping/activities', 'GET', {
			longitude: lon,
			latitude: lat,
			radius: params.radius,
			category: params.category,
		});
	}

	// list all the cities in a place by countryCode
	public listHotelsInCity(params: HotelsListParams) {
		return this.request('/reference-data/locations/hotels/by-city', 'GET', params);
	}

	// Used to search by hotelIDs and information such as check in date etc.
	public searchHotels(params: HotelsSearchParams) {
		return this.request_v3('/shopping/hotel-offers', 'GET', params);
	}

	// - Get the information about a flight order
	// https://developers.amadeus.com/self-service/category/flights/api-doc/flight-order-management/api-reference

	// - Delete a reservation
	// https://developers.amadeus.com/self-service/category/flights/api-doc/flight-order-management/api-reference

	// ===================== RESTAURANT AND ATTRACTIONS/ACTIVITIES =====================

	// - Get activities to do in a place:
	// https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/tours-and-activities/api-reference

	// - Point of interests (restuarantes and stuff):
	// https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/points-of-interest/api-reference

	// ===================== HOTELS =====================
	// https://developers.amadeus.com/self-service/category/hotels/api-doc/hotel-list

	// Get list of hotels

	// Get price confirmation

	// Book the hotel

	// ===================== CAR TRANSFERS =====================
	// https://developers.amadeus.com/self-service/category/cars-and-transfers/api-doc/transfer-booking/api-reference
}

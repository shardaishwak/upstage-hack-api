import axios from 'axios';

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

/**
 * TODO: Generate the parametrs through Chat AI: will make it easy. User writes: we want to go HERE on THIS, we are in XX ... and the AI will generate the parameters
 */
export class Amadeus {
	private BASE_URL = 'https://test.api.amadeus.com/v2';
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
		return this.request('/booking/flight-orders', 'POST', null, params);
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

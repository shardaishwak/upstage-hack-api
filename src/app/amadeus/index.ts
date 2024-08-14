import axios from 'axios';

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

	getFlightOffers(
		originLocationCode: string,
		destinationLocationCode: string,
		departureDate: string,
		returnDate: string,
		adults: number,
		max: number
	) {
		const params = {
			originLocationCode,
			destinationLocationCode,
			departureDate,
			returnDate,
			adults,
			max,
		};
		return this.request('/shopping/flight-offers', 'GET', params);
	}
}

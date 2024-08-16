export interface AddressCoordinate {
	place_id: number;
	licence: string;
	osm_type: string;
	osm_id: number;
	boundingbox: string[];
	lat: string;
	lon: string;
	display_name: string;
	class: string;
	type: string;
	importance: number;
}

export class MapUtilities {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	public async getCoordinates(address: string) {
		const response = await fetch(
			`https://geocode.maps.co/search?q=${address}&api_key=${this.apiKey}`
		);
		const data = (await response.json()) as AddressCoordinate[];

		if (data.length > 0) {
			const { lon, lat } = data[0];

			return [parseFloat(lon), parseFloat(lat)] as [number, number];
		} else throw new Error(`Could not find coordinates for address: ${address}`);
	}
}

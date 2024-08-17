export interface PointsOfInterest {
	type: string;
	geometry: Geometry;
	properties: Properties;
}

export interface Geometry {
	coordinates: number[];
	type: string;
}

export interface Properties {
	name: string;
	mapbox_id: string;
	feature_type: string;
	address: string;
	full_address: string;
	place_formatted: string;
	context: Context;
	coordinates: Coordinates;
	language: string;
	maki: string;
	poi_category: string[];
	poi_category_ids: string[];
	external_ids: ExternalIds;
	metadata: Metadata;
}

export interface Context {
	country: Country;
	postcode: Postcode;
	place: Place;
	address: Address;
	street: Street;
}

export interface Country {
	name: string;
	country_code: string;
	country_code_alpha_3: string;
}

export interface Postcode {
	id: string;
	name: string;
}

export interface Place {
	id: string;
	name: string;
}

export interface Address {
	name: string;
	address_number: string;
	street_name: string;
}

export interface Street {
	name: string;
}

export interface Coordinates {
	latitude: number;
	longitude: number;
	routable_points: RoutablePoint[];
}

export interface RoutablePoint {
	name: string;
	latitude: number;
	longitude: number;
}

export interface ExternalIds {
	foursquare: string;
}

export interface Metadata {
	phone: string;
	website: string;
	open_hours: OpenHours;
}

export interface OpenHours {
	periods: Period[];
}

export interface Period {
	open: Open;
	close: Close;
}

export interface Open {
	day: number;
	time: string;
}

export interface Close {
	day: number;
	time: string;
}

export interface SerpFlight {
	search_metadata: SearchMetadata;
	search_parameters: SearchParameters;
	best_flights: BestFlight[];
	other_flights: OtherFlight[];
	price_insights: PriceInsights;
}

export interface SearchMetadata {
	id: string;
	status: string;
	json_endpoint: string;
	created_at: string;
	processed_at: string;
	google_flights_url: string;
	raw_html_file: string;
	prettify_html_file: string;
	total_time_taken: number;
}

export interface SearchParameters {
	engine: string;
	hl: string;
	gl: string;
	type: string;
	departure_id: string;
	arrival_id: string;
	outbound_date: string;
	currency: string;
}

export interface BestFlight {
	flights: Flight[];
	layovers: Layover[];
	total_duration: number;
	carbon_emissions: CarbonEmissions;
	price: number;
	type: string;
	airline_logo: string;
	booking_token: string;
}

export interface Flight {
	departure_airport: DepartureAirport;
	arrival_airport: ArrivalAirport;
	duration: number;
	airplane: string;
	airline: string;
	airline_logo: string;
	travel_class: string;
	flight_number: string;
	legroom: string;
	extensions: string[];
	ticket_also_sold_by?: string[];
}

export interface DepartureAirport {
	name: string;
	id: string;
	time: string;
}

export interface ArrivalAirport {
	name: string;
	id: string;
	time: string;
}

export interface Layover {
	duration: number;
	name: string;
	id: string;
	overnight?: boolean;
}

export interface CarbonEmissions {
	this_flight: number;
	typical_for_this_route: number;
	difference_percent: number;
}

export interface OtherFlight {
	flights: Flight2[];
	layovers: Layover2[];
	total_duration: number;
	carbon_emissions: CarbonEmissions2;
	price: number;
	type: string;
	airline_logo: string;
	booking_token: string;
}

export interface Flight2 {
	departure_airport: DepartureAirport2;
	arrival_airport: ArrivalAirport2;
	duration: number;
	airplane: string;
	airline: string;
	airline_logo: string;
	travel_class: string;
	flight_number: string;
	ticket_also_sold_by?: string[];
	legroom: string;
	extensions: string[];
	often_delayed_by_over_30_min?: boolean;
}

export interface DepartureAirport2 {
	name: string;
	id: string;
	time: string;
}

export interface ArrivalAirport2 {
	name: string;
	id: string;
	time: string;
}

export interface Layover2 {
	duration: number;
	name: string;
	id: string;
	overnight?: boolean;
}

export interface CarbonEmissions2 {
	this_flight: number;
	typical_for_this_route: number;
	difference_percent: number;
}

export interface PriceInsights {
	lowest_price: number;
	price_level: string;
	typical_price_range: number[];
	price_history: number[][];
}

import { GoogleEventsResult } from '../../config/serp/getGoogleEvents';
import { GoogleFlightData } from '../../config/serp/getGoogleFlights';
import { GoogleFoodResult } from '../../config/serp/getGoogleFood';
import { GoogleHotelProperty } from '../../config/serp/getGoogleHotels';
import { GooglePlacesResult } from '../../config/serp/getGooglePlaces';
import { FlightOffer$1 } from '../../types/amadeus';
import { PointsOfInterest } from '../../types/mapbox';
import { IUser } from '../user/user.interface';

export type AmadeusFlightOffer = FlightOffer$1;
export interface AmadeusHotelOffer {
	chainCode: string;
	iataCode: string;
	dupeId: number;
	name: string;
	hotelId: string;
	geoCode: {
		latitude: number;
		longitude: number;
	};
	address: { countryCode: string };
	lastUpdate: string;
}
export type AmadeusActivityOffer = PointsOfInterest;

export interface IItinerary {
	title: string;
	admin: IUser;
	users: ItineraryUser[];
	content: ItineraryContent[];

	isBooked: boolean;
	booking: any;

	pricing: any;

	flight?: AmadeusFlightOffer;
	hotels: AmadeusHotelOffer[];
	activities: AmadeusActivityOffer[];

	g_flights: GoogleFlightData['best_flights'];
	g_hotels: GoogleHotelProperty[];
	g_top_sights: GooglePlacesResult['top_sights']['sights'];
	g_local_results: GooglePlacesResult['local_results']['places'];
	g_restaurants: GoogleFoodResult[];
	g_places_shopping: GooglePlacesResult['shopping_results'];
	g_events: GoogleEventsResult['events_results'];

	createdAt: string;
	updatedAt: string;

	departure: string;
	arrival: string;
	fromDate: string;
	toDate: string;
	people: number;
	preferences: string[];
}

export enum ItineraryType {
	FLIGHT = 'flight',
	TRANSPORTATION = 'transportation',
	ACCOMMODATION = 'accommodation',
	RESTAURANT = 'restaurant',
}

export type ItineraryContent = {
	type: ItineraryType;
	position: number;
	date: string;
};

export type ItineraryUser = {
	preferences: string[];
	user: IUser;
	travelerInfo?: TravelerInfo;
};

export type TravelerInfo = {
	dateOfBirth: string;
	name: {
		firstName: string;
		lastName: string;
	};
	gender: 'MALE' | 'FEMALE';
	contact: {
		emailAddress: string;
		phones: { deviceType: 'MOBILE'; countryCallingCode: string; number: string }[];
	};
	documents: {
		documentType: 'PASSPORT' | 'ID_CARD' | 'VISA' | 'OTHER';
		birthPlace: string;
		issuanceLocation: string;
		issuanceDate: string;
		number: string;
		expiryDate: string;
		issuanceCountry: string;
		validityCountry: string;
		nationality: string;
		holder: boolean;
	}[];
};

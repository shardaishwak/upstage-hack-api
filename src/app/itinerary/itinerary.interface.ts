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
	users: IUser[];
	content: ItineraryContent[];
	posterImage: string;

	flight: AmadeusFlightOffer;
	hotels: AmadeusHotelOffer[];
	activities: AmadeusActivityOffer[];

	createdAt: string;
	updatedAt: string;
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
	budget: number;
	preferences: string[];
	currency: string;
};

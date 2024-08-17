import { FlightOffer$1 } from '../../types/amadeus';
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
export interface AmadeusActivityOffer {
	type: string;
	id: string;
	self: {
		href: string;
		methods: string[];
	};
	name: string;
	description: string;
	geoCode: {
		latitude: number;
		longitude: number;
	};
	price: {
		currencyCode?: string;
	};
	pictures: string[];
	minimumDuration: string;
}

export interface IItinerary {
	title: string;
	admin: IUser;
	users: IUser[];
	content: ItineraryContent[];
	posterImage: string;

	flight: AmadeusFlightOffer;
	hotels: AmadeusHotelOffer[];
	activities: AmadeusActivityOffer[];
	sightseeing: any[];
	restaurants: any[];

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

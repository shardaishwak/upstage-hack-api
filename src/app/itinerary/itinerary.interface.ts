import { IUser } from '../user/user.interface';

export interface IItinerary {
	title: string;
	admin: IUser;
	users: IUser[];
	content: ItineraryContent[];
	posterImage: string;

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

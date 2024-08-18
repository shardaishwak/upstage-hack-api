import { IItinerary } from '../itinerary/itinerary.interface';

export interface IUser {
	email: string;
	provider: {
		name: string;
		id: string;
	};
	name: string;
	image: string;

	preferences: string[];

	createdAt: string;
	updatedAt: string;
}

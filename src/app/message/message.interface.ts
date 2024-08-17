import { IItinerary } from '../itinerary/itinerary.interface';
import { IUser } from '../user/user.interface';

export interface IMessage {
	text: string;
	itinerary: IItinerary;
	creator: IUser;
	googleId: string;

	createdAt: string;
	updatedAt: string;
}

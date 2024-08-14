export interface IUser {
	email: string;
	provider: {
		name: string;
		id: string;
	};
	name: string;
	image: string;

	// TODO - Add itineraries model
	itineraries: string[];
	preferences: string[];

	createdAt: string;
	updatedAt: string;
}

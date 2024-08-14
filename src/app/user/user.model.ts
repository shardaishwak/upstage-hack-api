import mongoose from 'mongoose';
import { IUser } from './user.interface';
import { Model } from '../../utils/model';

const UserSchema = new mongoose.Schema<IUser>(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		provider: {
			name: {
				type: String,
				required: true,
			},
			id: {
				type: String,
				required: true,
			},
		},
		name: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		itineraries: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: Model.ITINERARY,
					_id: false,
				},
			],
			default: [],
			_id: false,
		},
		preferences: {
			type: [String],
			required: true,
		},
	},
	{ timestamps: true }
);

export const UserModel = mongoose.model<IUser>(Model.USER, UserSchema);

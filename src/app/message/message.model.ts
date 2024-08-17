import mongoose from 'mongoose';
import { IMessage } from './message.interface';
import { Model } from '../../utils/model';

const MessageSchema = new mongoose.Schema<IMessage>(
	{
		text: {
			type: String,
			required: true,
		},
		itinerary: {
			type: mongoose.Schema.Types.ObjectId,
			ref: Model.ITINERARY,
			required: true,
		},
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		googleId: {
			type: String,
		}
	},
	{ timestamps: true }
);

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);

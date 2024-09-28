import mongoose from 'mongoose';
import { IItinerary, ItineraryContent, ItineraryType, ItineraryUser } from './itinerary.interface';
import { Model } from '../../utils/model';

const ItineraryContentSchema = new mongoose.Schema<ItineraryContent>({
	type: {
		type: String,
		enum: Object.values(ItineraryType),
		required: true,
	},
	position: {
		type: Number,
		required: true,
	},
	date: {
		type: String,
		required: true,
	},
});

const ItineraryUserSchema = new mongoose.Schema<ItineraryUser>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: Model.USER,
			required: true,
		},
		preferences: {
			type: [String],
			default: [],
		},
		travelerInfo: {
			type: Object,
			default: {},
		},
	},
	{ _id: false }
);

const ItinerarySchema = new mongoose.Schema<IItinerary>(
	{
		title: {
			type: String,
			required: true,
		},
		admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: Model.USER,
			required: true,
		},
		users: {
			type: [ItineraryUserSchema],
			default: [],
		},
		content: {
			type: [ItineraryContentSchema],
			default: [],
		},

		flight: {
			type: Object,
			default: {},
		},
		hotels: {
			type: [
				{
					type: Object,
					default: {},
					_id: true,
				},
			],
			default: [],
		},
		activities: {
			type: [
				{
					type: Object,
					default: {},
					_id: true,
				},
			],
			default: [],
		},
		pricing: {
			type: Object,
			default: {},
		},
		payment: {
			type: Object,
			default: {},
		},
		isBooked: {
			type: Boolean,
			default: false,
		},
		booking: {
			type: Object,
			default: {},
		},
	},
	{ timestamps: true }
);

export const ItineraryModel = mongoose.model<IItinerary>(Model.ITINERARY, ItinerarySchema);

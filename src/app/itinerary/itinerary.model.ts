import mongoose from 'mongoose';
import { IItinerary, ItineraryContent, ItineraryType } from './itinerary.interface';
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

const ItineraryUserSchema = new mongoose.Schema(
	{
		budget: {
			type: Number,
			required: true,
		},
		preferences: {
			type: [String],
			default: [],
		},
		currency: {
			type: String,
			required: true,
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
		posterImage: {
			type: String,
			required: true,
		},
		flight: {
			type: Object,
			default: {},
		},
		hotels: {
			type: [Object],
			default: [],
		},
		activities: {
			type: [Object],
			default: [],
		},
		sightseeing: {
			type: [Object],
			default: [],
		},
		restaurants: {
			type: [Object],
			default: [],
		},
	},
	{ timestamps: true }
);

export const ItineraryModel = mongoose.model<IItinerary>(Model.ITINERARY, ItinerarySchema);

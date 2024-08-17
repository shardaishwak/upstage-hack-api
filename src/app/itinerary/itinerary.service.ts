import { ItineraryModel } from './itinerary.model';

export const itineraryServices = {
	// itinerary service functions go here
	saveFlight: async (id: string, flightData: any) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			id,
			{ flight: flightData },
			{ new: true }
		);
		return itinerary;
	},
	saveHotel: async (id: string, hotelData: any) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			id,
			{ $push: { hotels: hotelData } },
			{ new: true }
		);
		return itinerary;
	},
	saveActivity: async (id: string, activityData: any) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			id,
			{ $push: { activities: activityData } },
			{ new: true }
		);
		return itinerary;
	},
	saveSightseeing: async (id: string, sightseeingData: any) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			id,
			{ $push: { sightseeing: sightseeingData } },
			{ new: true }
		);
		return itinerary;
	},
	saveRestaurant: async (id: string, restaurantData: any) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			id,
			{ $push: { restaurants: restaurantData } },
			{ new: true }
		);
		return itinerary;
	},

	deleteFlight: async (id: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(id, { flight: {} }, { new: true });
		return itinerary;
	},
};

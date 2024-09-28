import { NextFunction, Request, Response } from 'express';
import { itineraryServices } from './itinerary.service';
import { UserModel } from '../user/user.model';

export const itineraryController = {
	createNewItinerary: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await UserModel.findOne({ 'provider.id': req.body.userId });
			if (!user) {
				throw new Error('User not found');
			}
			// create new itinerary
			const response = await itineraryServices.create(user.id, req.body.title);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	getItinerary: async (req: Request, res: Response, next: NextFunction) => {
		try {
			// get itinerary data
			const response = await itineraryServices.getItinerary(req.params.id);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	getItinerariesByUser: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await UserModel.findOne({ 'provider.id': req.params.userId });
			if (!user) {
				throw new Error('User not found');
			}
			// get itineraries by user
			const response = await itineraryServices.getItineraries(user.id);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	saveFlight: async (req: Request, res: Response, next: NextFunction) => {
		try {
			// save flight data
			const flight = req.body.flight;
			const response = await itineraryServices.saveFlight(req.params.id, flight);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	saveHotel: async (req: Request, res: Response, next: NextFunction) => {
		try {
			// save hotel data
			const hotel = req.body.hotel;
			const response = await itineraryServices.saveHotel(req.params.id, hotel);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	saveActivity: async (req: Request, res: Response, next: NextFunction) => {
		try {
			// save activity data
			const activity = req.body.activity;
			const response = await itineraryServices.saveActivity(req.params.id, activity);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	deleteFlight: async (req: Request, res: Response, next: NextFunction) => {
		try {
			// delete flight data
			const response = await itineraryServices.deleteFlight(req.params.id);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	deleteHotel: async (req: Request, res: Response, next: NextFunction) => {
		try {
			// delete hotel data
			const response = await itineraryServices.deleteHotel(req.params.id, req.params.hotelId);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	deleteActivity: async (req: Request, res: Response, next: NextFunction) => {
		try {
			// delete activity data
			const response = await itineraryServices.deleteActivity(
				req.params.id,
				req.params.activityId
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	addNewMember: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await UserModel.findOne({ 'provider.id': req.body.userId });
			if (!user) {
				throw new Error('User not found');
			}
			// add new member to itinerary
			const response = await itineraryServices.addNewMember(req.params.id, user.id);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	updateTravelerInfo: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await UserModel.findOne({ 'provider.id': req.params.userId });
			if (!user) {
				throw new Error('User not found');
			}

			const travelerInfo = req.body.travelerInfo;
			// update traveler info
			const response = await itineraryServices.updateTravelerInfo(
				req.params.id,
				user.id,
				travelerInfo
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	confirmPricing: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.confirmPricing(req.params.id);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	checkTravelerInfo: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.checkIfAllTravelerInfoIsProvided(
				req.params.id
			);
			res.send(response);
		} catch (error) {
			return next(error);
		}
	},
	bookItinerary: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.bookItinerary(req.params.id);
			res.send(response);
		} catch (error) {
			return next(error);
		}
	},
	getUserBookings: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await UserModel.findOne({ 'provider.id': req.params.userId });
			if (!user) {
				throw new Error('User not found');
			}
			const response = await itineraryServices.getUserBookings(user.id);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
	getbooking: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.getBooking(req.params.id);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	// ggoogle
	saveGoogleOutoundFlight: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const flight = req.body.flight;
			const response = await itineraryServices.saveGoogleOutboundFlight(
				req.params.id,
				flight
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	saveGoogleReturnFlight: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const flight = req.body.flight;
			const response = await itineraryServices.saveGoogleReturnFlight(req.params.id, flight);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	saveGoogleHotel: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const hotel = req.body.hotel;
			const response = await itineraryServices.saveGoogleHotel(req.params.id, hotel);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	saveGoogleTopSights: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const topSights = req.body.topSights;
			const response = await itineraryServices.saveGoogleTopSights(req.params.id, topSights);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	saveGoogleLocalResults: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const localResults = req.body.localResults;
			const response = await itineraryServices.saveGoogleLocalResults(
				req.params.id,
				localResults
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	saveGoogleRestaurants: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const restaurants = req.body.restaurants;
			const response = await itineraryServices.saveGoogleRestaurants(
				req.params.id,
				restaurants
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	saveGoogleShopping: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const shopping = req.body.shopping;
			const response = await itineraryServices.saveGoogleShopping(req.params.id, shopping);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	saveGoogleEvents: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const events = req.body.events;
			const response = await itineraryServices.saveGoogleEvents(req.params.id, events);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	deleteGoogleOutboundFlight: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.deleteGoogleOutboundFlight(req.params.id);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	deleteGoogleReturnFlight: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.deleteGoogleReturnFlight(req.params.id);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	deleteGoogleHotel: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.deleteGoogleHotel(
				req.params.id,
				req.params.property_token
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	deleteGoogleTopSights: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.deleteGoogleTopSights(
				req.params.id,
				req.params.title
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	deleteGoogleLocalResults: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.deleteGoogleLocalResults(
				req.params.id,
				req.params.placeId
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	deleteGoogleRestaurants: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.deleteGoogleRestaurants(
				req.params.id,
				req.params.title
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	deleteGoogleShopping: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.deleteGoogleShopping(
				req.params.id,
				req.params.title
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},

	deleteGoogleEvents: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await itineraryServices.deleteGoogleEvents(
				req.params.id,
				req.params.title
			);
			res.send(response);
		} catch (error) {
			next(error);
		}
	},
};

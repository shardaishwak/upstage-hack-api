import { NextFunction, Request, Response } from 'express';
import { itineraryServices } from './itinerary.service';

export const itineraryController = {
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
			// get itineraries by user
			const response = await itineraryServices.getItineraries(req.params.userId);
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
};

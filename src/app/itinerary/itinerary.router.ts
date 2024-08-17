import express from 'express';
import { itineraryServices } from './itinerary.service';

const router = express.Router();

router.post('/:id/flight', async (req, res, next) => {
	try {
		// save flight data
		const response = await itineraryServices.saveFlight(req.params.id, req.body);
		res.send(response);
	} catch (error) {
		next(error);
	}
});

router.post('/:id/hotel', async (req, res, next) => {
	try {
		// save hotel data
		const response = await itineraryServices.saveHotel(req.params.id, req.body);
		res.send(response);
	} catch (error) {
		next(error);
	}
});

router.post('/:id/activity', async (req, res, next) => {
	try {
		// save activity data
		const response = await itineraryServices.saveActivity(req.params.id, req.body);
		res.send(response);
	} catch (error) {
		next(error);
	}
});

router.delete('/:id/flight', async (req, res, next) => {
	try {
		// delete flight data
		const response = await itineraryServices.deleteFlight(req.params.id);
		res.send(response);
	} catch (error) {
		next(error);
	}
});

router.delete('/:id/hotel/:hotelId', async (req, res, next) => {
	try {
		// delete hotel data
		const response = await itineraryServices.deleteHotel(req.params.id, req.params.hotelId);
		res.send(response);
	} catch (error) {
		next(error);
	}
});

router.delete('/:id/activity/:activityId', async (req, res, next) => {
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
});

export const itineraryRouter = router;

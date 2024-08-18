import express from 'express';
import { itineraryServices } from './itinerary.service';
import { itineraryController } from './itinerary.controller';

const router = express.Router();

router.get('/:id', itineraryController.getItinerary);

router.get('/:userId', itineraryController.getItinerariesByUser);

router.post('/', itineraryController.createNewItinerary);

router.post('/:id/flight', itineraryController.saveFlight);

router.post('/:id/hotel', itineraryController.saveHotel);

router.post('/:id/activity', itineraryController.saveActivity);

router.delete('/:id/flight', itineraryController.deleteFlight);

router.delete('/:id/hotel/:hotelId', itineraryController.deleteHotel);

router.delete('/:id/activity/:activityId', itineraryController.deleteActivity);

export const itineraryRouter = router;

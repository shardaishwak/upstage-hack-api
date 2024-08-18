import express from 'express';
import { itineraryServices } from './itinerary.service';
import { itineraryController } from './itinerary.controller';

const router = express.Router();

router.get('/:id', itineraryController.getItinerary);

router.get('/user/:userId', itineraryController.getItinerariesByUser);

router.post('/', itineraryController.createNewItinerary);

router.post('/:id/confirm-pricing', itineraryController.addNewMember);

router.post('/:id/check-traveler-info', itineraryController.checkTravelerInfo);

router.post('/:id/flight', itineraryController.saveFlight);

router.post('/:id/new-member', itineraryController.addNewMember);

router.post('/:id/hotel', itineraryController.saveHotel);

router.post('/:id/activity', itineraryController.saveActivity);

router.delete('/:id/flight', itineraryController.deleteFlight);

router.delete('/:id/hotel/:hotelId', itineraryController.deleteHotel);

router.delete('/:id/activity/:activityId', itineraryController.deleteActivity);

router.put('/itinerary/:id/user/:userId', itineraryController.updateTravelerInfo); // add travel info

export const itineraryRouter = router;

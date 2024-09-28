import express from 'express';
import { itineraryServices } from './itinerary.service';
import { itineraryController } from './itinerary.controller';

const router = express.Router();

router.get('/:id', itineraryController.getItinerary);

router.get('/:id/magic', itineraryController.magicItinerary);

router.get('/bookings/:id', itineraryController.getbooking);
router.get('/bookings/user/:userId', itineraryController.getUserBookings);

router.get('/user/:userId', itineraryController.getItinerariesByUser);

router.post('/', itineraryController.createNewItinerary);

router.post('/:id/confirm-pricing', itineraryController.confirmPricing);

router.get('/:id/check-travelers-info', itineraryController.checkTravelerInfo);

router.post('/:id/flight', itineraryController.saveFlight);

router.post('/:id/new-member', itineraryController.addNewMember);

router.post('/:id/hotel', itineraryController.saveHotel);

router.post('/:id/activity', itineraryController.saveActivity);

router.post('/:id/book', itineraryController.bookItinerary);

router.delete('/:id/flight', itineraryController.deleteFlight);

router.delete('/:id/hotel/:hotelId', itineraryController.deleteHotel);

router.delete('/:id/activity/:activityId', itineraryController.deleteActivity);

router.put('/:id/user/:userId', itineraryController.updateTravelerInfo); // add travel info

//google

router.post('/:id/google/outbound-flight', itineraryController.saveGoogleOutoundFlight);

router.post('/:id/google/return-flight', itineraryController.saveGoogleReturnFlight);

router.post('/:id/google/hotel', itineraryController.saveGoogleHotel);

router.post('/:id/google/top-sights', itineraryController.saveGoogleTopSights);

router.post('/:id/google/local-results', itineraryController.saveGoogleLocalResults);

router.post('/:id/google/restaurants', itineraryController.saveGoogleRestaurants);

router.post('/:id/google/shopping', itineraryController.saveGoogleShopping);

router.post('/:id/google/events', itineraryController.saveGoogleEvents);

router.delete('/:id/google/outbound-flight/', itineraryController.deleteGoogleOutboundFlight);

router.delete('/:id/google/return-flight/', itineraryController.deleteGoogleReturnFlight);

router.delete('/:id/google/hotel/:property_token', itineraryController.deleteGoogleHotel);

router.delete('/:id/google/top-sights/:title', itineraryController.deleteGoogleTopSights);

router.delete('/:id/google/local-results/:placeId', itineraryController.deleteGoogleLocalResults);

router.delete('/:id/google/restaurants/:title', itineraryController.deleteGoogleRestaurants);

router.delete('/:id/google/shopping/:title', itineraryController.deleteGoogleShopping);

router.delete('/:id/google/events/:title', itineraryController.deleteGoogleEvents);

export const itineraryRouter = router;

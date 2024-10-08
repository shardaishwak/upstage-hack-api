import getGoogleEvents from './serp/getGoogleEvents';
import { getGoogleFlights } from './serp/getGoogleFlights';
import { getGoogleFood } from './serp/getGoogleFood';
import getGoogleHotels from './serp/getGoogleHotels';
import getGooglePlaces from './serp/getGooglePlaces';
import { getGoogleReturnFlight } from './serp/getGoogleReturnFlights';

export const serpApi = {
	getGoogleFlights,
	getGoogleReturnFlight,
	getGoogleHotels,
	getGoogleFood,
	getGoogleEvents,
	getGooglePlaces,
};

import amadeus from '../../config/amadeus';
import { GoogleEventsResult } from '../../config/serp/getGoogleEvents';
import { GoogleFlightData } from '../../config/serp/getGoogleFlights';
import { GoogleFoodResult } from '../../config/serp/getGoogleFood';
import { GoogleHotelProperty } from '../../config/serp/getGoogleHotels';
import { GooglePlacesResult } from '../../config/serp/getGooglePlaces';
import { AmadeusFlightOffer, TravelerInfo } from './itinerary.interface';
import { ItineraryModel } from './itinerary.model';

import { nanoid } from 'nanoid';

export const itineraryServices = {
	create: async (userId: string, title: string) => {
		const itinerary = await ItineraryModel.create({
			title,
			admin: userId,
			users: [
				{
					user: userId,
					preferences: [],
				},
			],
		});
		return itinerary;
	},

	getItinerary: async (id: string) => {
		const itinerary = await ItineraryModel.findById(id)
			.populate('users.user')
			.populate('admin');
		return itinerary;
	},

	addNewMember: async (itineraryId: string, userId: string) => {
		// check if the user is already a member
		let itinerary = await ItineraryModel.findById(itineraryId);
		const isMember = itinerary?.users.some((user) => user.toString() === userId);

		if (isMember) {
			return itinerary;
		}

		itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{
				$push: {
					users: {
						user: userId,
						preferences: [],
					},
				},
			},
			{ new: true }
		);
		return itinerary;
	},

	getItineraries: async (userId: string) => {
		const itineraries = await ItineraryModel.find({
			users: {
				$elemMatch: {
					user: userId,
				},
			},
			isBooked: false,
		});

		return itineraries;
	},
	// itinerary service functions go here
	saveFlight: async (id: string, flightData: AmadeusFlightOffer) => {
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

	deleteFlight: async (itineraryId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ flight: {} },
			{ new: true }
		);
		return itinerary;
	},
	deleteHotel: async (itineraryId: string, hotelId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $pull: { hotels: { _id: hotelId } } },
			{ new: true }
		);
		return itinerary;
	},
	deleteActivity: async (itineraryId: string, activityId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $pull: { activities: { _id: activityId } } },
			{ new: true }
		);
		return itinerary;
	},
	confirmPricing: async (itineraryId: string) => {
		const itinerary = await ItineraryModel.findById(itineraryId)
			.populate('admin')
			.populate('users.user');

		if (!itinerary) throw new Error('Itinerary not found');
		const flightOffer = itinerary?.flight;

		if (!flightOffer) throw new Error('No flight offers found');
		const itineraryConfirmationResult = await amadeus.shopping.flightOffers.pricing.post({
			data: {
				type: 'flight-offers-pricing',
				flightOffers: [flightOffer],
			},
		});

		if (!itineraryConfirmationResult.data) throw new Error('No pricing data found');

		// update itinerary with pricing data
		itinerary.pricing = itineraryConfirmationResult.data;
		await itinerary.save();

		return itineraryConfirmationResult.data;
	},
	updateTravelerInfo: async (itineraryId: string, userId: string, travelerInfo: any) => {
		const itinerary = await ItineraryModel.findOneAndUpdate(
			{
				_id: itineraryId,
				'users.user': userId,
			},
			{
				$set: {
					'users.$.travelerInfo': travelerInfo,
				},
			},
			{ new: true }
		);
		return itinerary;
	},
	checkIfAllTravelerInfoIsProvided: async (itineraryId: string) => {
		const itinerary = await ItineraryModel.findById(itineraryId).populate('users.user');

		if (!itinerary) throw new Error('Itinerary not found');
		const users = itinerary.users;

		const results = [];
		for (const user of users) {
			if (!user.travelerInfo) throw new Error('Traveler info is missing');

			const res = itineraryServices._checkAllTravelerFields(
				user.user?.email,
				user.travelerInfo
			);
			results.push(...res);
		}

		return results;
	},
	_checkAllTravelerFields: (email: string, travelerInfo: TravelerInfo) => {
		const errors = [];
		if (!travelerInfo?.dateOfBirth) errors.push(email + ':' + 'Date of birth is required');

		if (!travelerInfo.name || !travelerInfo.name?.firstName)
			errors.push(email + ':' + 'First name is required');
		if (!travelerInfo.name?.lastName) errors.push(email + ':' + 'Last name is required');

		if (
			!travelerInfo?.gender ||
			(travelerInfo?.gender !== 'MALE' && travelerInfo?.gender !== 'FEMALE')
		) {
			errors.push(email + ':' + 'Gender is required and must be either MALE or FEMALE');
		}

		if (!travelerInfo.contact || !travelerInfo.contact?.emailAddress)
			errors.push(email + ':' + 'Email address is required');
		if (
			!travelerInfo.contact?.phones ||
			!Array.isArray(travelerInfo.contact?.phones) ||
			travelerInfo.contact?.phones?.length === 0
		) {
			errors.push(email + ':' + 'At least one phone number is required');
		}

		travelerInfo.contact?.phones?.forEach((phone, index) => {
			if (!phone.deviceType || phone?.deviceType !== 'MOBILE')
				errors.push(email + ':' + `Phone ${index + 1}: deviceType must be MOBILE`);
			if (!phone.countryCallingCode)
				errors.push(email + ':' + `Phone ${index + 1}: country calling code is required`);
			if (!phone.number)
				errors.push(email + ':' + `Phone ${index + 1}: phone number is required`);
		});

		if (
			!travelerInfo?.documents ||
			!Array.isArray(travelerInfo.documents) ||
			travelerInfo.documents?.length === 0
		) {
			errors.push(email + ':' + 'At least one document is required');
		}

		for (let i = 0; i < travelerInfo?.documents?.length; i++) {
			const document = travelerInfo.documents[i];
			const index = i;

			if (!document.documentType)
				errors.push(email + ':' + `Document ${index + 1}: document type is required`);
			if (!document.birthPlace)
				errors.push(email + ':' + `Document ${index + 1}: birth place is required`);
			if (!document.issuanceLocation)
				errors.push(email + ':' + `Document ${index + 1}: issuance location is required`);
			if (!document.issuanceDate)
				errors.push(email + ':' + `Document ${index + 1}: issuance date is required`);
			if (!document.number)
				errors.push(email + ':' + `Document ${index + 1}: document number is required`);
			if (!document.expiryDate)
				errors.push(email + ':' + `Document ${index + 1}: expiry date is required`);
			if (!document.issuanceCountry)
				errors.push(email + ':' + `Document ${index + 1}: issuance country is required`);
			if (!document.validityCountry)
				errors.push(email + ':' + `Document ${index + 1}: validity country is required`);
			if (!document.nationality)
				errors.push(email + ':' + `Document ${index + 1}: nationality is required`);
			if (typeof document.holder !== 'boolean')
				errors.push(email + ':' + `Document ${index + 1}: holder must be a boolean value`);
		}

		return errors;
	},
	bookItinerary: async (itineraryId: string) => {
		const itinerary = await ItineraryModel.findById(itineraryId)
			.populate('admin')
			.populate('users.user');

		if (!itinerary) throw new Error('Itinerary not found');

		try {
			const flightOffer = itinerary.pricing?.flightOffers?.[0];
			if (!flightOffer) throw new Error('No flight offers found');
			const allFieldCheckResult = await itineraryServices.checkIfAllTravelerInfoIsProvided(
				itineraryId
			);
			if (allFieldCheckResult.length > 0) {
				throw new Error(
					'Some Travelers info is missing. Call /check-travelers-info to get the missing fields'
				);
			}

			const travelers = itinerary.users.map((user) => user.travelerInfo);

			// count total travelers in pricing
			const pricing = itinerary.pricing;
			if (!pricing) throw new Error('No pricing data found');
			const totalTravelers = pricing.flightOffers?.[0]?.travelerPricings?.length;

			if (!totalTravelers) throw new Error('No travelers found in pricing');
			if (totalTravelers !== travelers.length)
				throw new Error(
					'Travelers count mismatch. There should be ' +
						totalTravelers +
						' travelers, but found ' +
						travelers.length
				);

			// add id field for traveler info
			travelers.forEach((traveler, index) => ({
				...traveler,
				id: index + 1,
			}));

			const remarks = {
				general: [
					{
						subType: 'GENERAL_MISCELLANEOUS',
						text: 'ONLINE BOOKING FROM TRAVENTURE',
					},
				],
			};

			const ticketAgreement = {
				option: 'DELAY_TO_CANCEL',
				delay: '6D',
			};

			const contacts = [
				{
					addresseeName: {
						firstName: 'ISHWAK',
						lastName: 'SHARDA',
					},
					companyName: 'TRAVENTURE',
					purpose: 'STANDARD',
					phones: [
						{
							deviceType: 'LANDLINE',
							countryCallingCode: '34',
							number: '480080071',
						},
						{
							deviceType: 'MOBILE',
							countryCallingCode: '33',
							number: '480080072',
						},
					],
					emailAddress: 'support@traventure.com',
					address: {
						lines: ['Calle Prado, 16'],
						postalCode: '28014',
						cityName: 'Madrid',
						countryCode: 'ES',
					},
				},
			];
			let booking;

			booking = await amadeus.booking.flightOrders.post({
				data: {
					type: 'flight-order',
					flightOffers: [flightOffer],
					travelers: travelers as any,
					contacts: contacts as any,
					remarks: remarks as any,
					ticketingAgreement: ticketAgreement as any,
				},
			});
		} catch (err) {
			console.log(err);
		}

		const referenceId = nanoid(6).toLocaleUpperCase();
		// save te booking
		itinerary.booking = {
			referenceId,
		};
		itinerary.isBooked = true;

		await itinerary.save();

		return itinerary;
	},

	getUserBookings: async (userId: string) => {
		const itineraries = await ItineraryModel.find({
			users: {
				$elemMatch: {
					user: userId,
				},
			},
			isBooked: true,
		});

		return itineraries;
	},
	getBooking: async (bookingId: string) => {
		const itinerary = await ItineraryModel.findOne({ 'booking.referenceId': bookingId })
			.populate('admin')
			.populate('users.user');
		return itinerary;
	},

	saveAdditionalInfo: async (
		itineraryId: string,
		additionalInfo?: {
			departure?: string;
			arrival?: string;
			fromDate?: string;
			toDate?: string;
			people?: number;
			preferences?: string[];
		}
	) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ ...additionalInfo },
			{ new: true }
		);
		return itinerary;
	},

	saveGoogleOutboundFlight: async (
		itineraryId: string,
		data: GoogleFlightData['best_flights'][number]
	) => {
		const itinerary = await ItineraryModel.findById(itineraryId);
		if (!itinerary) throw new Error('Itinerary not found');

		const g_flight = itinerary.g_flights;
		g_flight[0] = data;

		await itinerary.save();

		return itinerary;
	},

	saveGoogleReturnFlight: async (
		itineraryId: string,
		data: GoogleFlightData['best_flights'][number]
	) => {
		const itinerary = await ItineraryModel.findById(itineraryId);
		if (!itinerary) throw new Error('Itinerary not found');

		const g_flight = itinerary.g_flights;
		if (g_flight.length == 1) {
			itinerary.g_flights.push(data);
		} else if (g_flight.length == 2) {
			itinerary.g_flights[1] = data;
		} else {
			throw new Error('Invalid operation. Outbound flight is not saved');
		}

		await itinerary.save();

		return itinerary;
	},

	saveGoogleHotel: async (itineraryId: string, data: GoogleHotelProperty) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $push: { g_hotels: data } },
			{ new: true }
		);

		return itinerary;
	},

	saveGoogleTopSights: async (
		itineraryId: string,
		data: GooglePlacesResult['top_sights']['sights']
	) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $push: { g_top_sights: data } },
			{ new: true }
		);

		return itinerary;
	},

	saveGoogleLocalResults: async (
		itineraryId: string,
		data: GooglePlacesResult['local_results']['places']
	) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $push: { g_local_results: data } },
			{ new: true }
		);

		return itinerary;
	},

	saveGoogleRestaurants: async (itineraryId: string, data: GoogleFoodResult) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $push: { g_restaurants: data } },
			{ new: true }
		);

		return itinerary;
	},

	saveGoogleShopping: async (
		itineraryId: string,
		data: GooglePlacesResult['shopping_results']
	) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $push: { g_places_shopping: data } },
			{ new: true }
		);

		return itinerary;
	},

	saveGoogleEvents: async (itineraryId: string, data: GoogleEventsResult['events_results']) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $push: { g_events: data } },
			{ new: true }
		);

		return itinerary;
	},

	deleteGoogleOutboundFlight: async (itineraryId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ g_flights: [] },
			{ new: true }
		);
		return itinerary;
	},

	deleteGoogleReturnFlight: async (itineraryId: string) => {
		const itinerary = await ItineraryModel.findById(itineraryId);

		if (!itinerary) throw new Error('Itinerary not found');

		const g_flight = itinerary.g_flights;

		if (g_flight.length == 2) {
			itinerary.g_flights.pop();
		} else if (g_flight.length == 1) {
			itinerary.g_flights = [];
		} else {
			throw new Error('Invalid operation. Outbound flight is not saved');
		}
	},

	deleteGoogleHotel: async (itineraryId: string, hotelId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $pull: { g_hotels: { _id: hotelId } } },
			{ new: true }
		);

		return itinerary;
	},

	deleteGoogleTopSights: async (itineraryId: string, sightId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $pull: { g_top_sights: { _id: sightId } } },
			{ new: true }
		);

		return itinerary;
	},

	deleteGoogleLocalResults: async (itineraryId: string, placeId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $pull: { g_local_results: { _id: placeId } } },
			{ new: true }
		);

		return itinerary;
	},

	deleteGoogleRestaurants: async (itineraryId: string, restaurantId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $pull: { g_restaurants: { _id: restaurantId } } },
			{ new: true }
		);

		return itinerary;
	},

	deleteGoogleShopping: async (itineraryId: string, placeId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $pull: { g_places_shopping: { _id: placeId } } },
			{ new: true }
		);

		return itinerary;
	},

	deleteGoogleEvents: async (itineraryId: string, eventId: string) => {
		const itinerary = await ItineraryModel.findByIdAndUpdate(
			itineraryId,
			{ $pull: { g_events: { _id: eventId } } },
			{ new: true }
		);

		return itinerary;
	},
};

import amadeus from '../../config/amadeus';
import { AmadeusFlightOffer, TravelerInfo } from './itinerary.interface';
import { ItineraryModel } from './itinerary.model';

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
			users: { $in: [{ user: userId }] },
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

		return itineraryConfirmationResult;
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
			results.push(res);
		}

		return results;
	},
	_checkAllTravelerFields: (email: string, travelerInfo: TravelerInfo) => {
		if (!travelerInfo.dateOfBirth) return email + ':' + 'Date of birth is required';

		if (!travelerInfo.name || !travelerInfo.name.firstName) return 'First name is required';
		if (!travelerInfo.name.lastName) return email + ':' + 'Last name is required';

		if (
			!travelerInfo.gender ||
			(travelerInfo.gender !== 'MALE' && travelerInfo.gender !== 'FEMALE')
		) {
			return email + ':' + 'Gender is required and must be either MALE or FEMALE';
		}

		if (!travelerInfo.contact || !travelerInfo.contact.emailAddress)
			return email + ':' + 'Email address is required';
		if (
			!travelerInfo.contact.phones ||
			!Array.isArray(travelerInfo.contact.phones) ||
			travelerInfo.contact.phones.length === 0
		) {
			return email + ':' + 'At least one phone number is required';
		}

		travelerInfo.contact.phones.forEach((phone, index) => {
			if (!phone.deviceType || phone.deviceType !== 'MOBILE')
				return email + ':' + `Phone ${index + 1}: deviceType must be MOBILE`;
			if (!phone.countryCallingCode)
				return email + ':' + `Phone ${index + 1}: country calling code is required`;
			if (!phone.number) return email + ':' + `Phone ${index + 1}: phone number is required`;
		});

		if (
			!travelerInfo.documents ||
			!Array.isArray(travelerInfo.documents) ||
			travelerInfo.documents.length === 0
		) {
			return email + ':' + 'At least one document is required';
		}

		for (let i = 0; i < travelerInfo.documents.length; i++) {
			const document = travelerInfo.documents[i];
			const index = i;

			if (!document.documentType)
				return email + ':' + `Document ${index + 1}: document type is required`;
			if (!document.birthPlace)
				return email + ':' + `Document ${index + 1}: birth place is required`;
			if (!document.issuanceLocation)
				return email + ':' + `Document ${index + 1}: issuance location is required`;
			if (!document.issuanceDate)
				return email + ':' + `Document ${index + 1}: issuance date is required`;
			if (!document.number)
				return email + ':' + `Document ${index + 1}: document number is required`;
			if (!document.expiryDate)
				return email + ':' + `Document ${index + 1}: expiry date is required`;
			if (!document.issuanceCountry)
				return email + ':' + `Document ${index + 1}: issuance country is required`;
			if (!document.validityCountry)
				return email + ':' + `Document ${index + 1}: validity country is required`;
			if (!document.nationality)
				return email + ':' + `Document ${index + 1}: nationality is required`;
			if (typeof document.holder !== 'boolean')
				return email + ':' + `Document ${index + 1}: holder must be a boolean value`;
		}

		return null;
	},
};

import * as http from 'node:http';
import * as https from 'node:https';
import { OutgoingHttpHeaders, IncomingHttpHeaders, IncomingMessage } from 'http';
import { RequestOptions } from 'https';
import { OutgoingHttpHeaders as OutgoingHttpHeaders$1 } from 'http2';

type Verb = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface IRequest {
	host: string;
	port: number;
	ssl: boolean;
	scheme: string;
	verb: Verb;
	path: string;
	params: any;
	queryPath: string;
	bearerToken: string | null;
	clientVersion: string;
	languageVersion: string;
	appId: string | null;
	appVersion: string | null;
	headers: OutgoingHttpHeaders;
}

/**
 * A Request object containing all the compiled information about this request.
 *
 * @property {string} host the host used for this API call
 * @property {number} port the port for this API call. Standard set to 443.
 * @property {boolean} ssl wether this API call uses SSL
 * @property {string} scheme the scheme inferred from the SSL state
 * @property {Verb} verb the HTTP method, for example `GET` or `POST`
 * @property {string} path the full path of the API endpoint
 * @property {Object} params the parameters to pass in the query or body
 * @property {string} queryPath the path and query string used for the API call
 * @property {string} bearerToken the authentication token
 * @property {string} clientVersion the version of the Amadeus library
 * @property {string} languageVersion the version of Node used
 * @property {string} appId the custom ID of the application using this library
 * @property {string} appVersion the custom version of the application
 *  using this library
 * @property {Record<string, string>} headers the request headers
 *
 * @param {Object} options
 */
declare class Request implements IRequest {
	appId: string | null;
	appVersion: string | null;
	bearerToken: string | null;
	clientVersion: string;
	headers: OutgoingHttpHeaders$1;
	host: string;
	languageVersion: string;
	params: any;
	path: string;
	port: number;
	queryPath: string;
	scheme: string;
	ssl: boolean;
	verb: Verb;
	constructor(options: Omit<IRequest, 'headers' | 'scheme' | 'queryPath'>);
	/**
	 * Compiles the options for the HTTP request.
	 *
	 * Used by Client.execute when executing this request against the server.
	 *
	 * @return {RequestOptions} an associative object of options to be passed into the
	 *  Client.execute function
	 * @public
	 */
	options(): RequestOptions;
	/**
	 * Creats the body for the API call, serializing the params if the verb is POST.
	 *
	 * @return {any} the serialized params
	 * @public
	 */
	body(): any;
	/**
	 * Builds up the custom User Agent
	 *
	 * @return {string} a user agent in the format "library/version language/version app/version"
	 * @private
	 */
	private userAgent;
	/**
	 * Builds the full query path, combining the path with the query params if the
	 * verb is 'GET'. For example: '/foo/bar?baz=qux'
	 *
	 * @return {string} the path and params combined into one string.
	 * @private
	 */
	private fullQueryPath;
	/**
	 * Adds an Authorization header if the BearerToken is present
	 *
	 * @private
	 */
	private addAuthorizationHeader;
	/**
	 * Adds a Content-Type header if the HTTP method equals POST
	 *
	 * @private
	 */
	private addContentTypeHeader;
	/**
	 * Adds HTTPOverride method if it is required
	 *
	 *  @private
	 */
	private addHTTPOverrideHeader;
}

/**
 * The response object returned for every API call.
 *
 * @param {Object} http_response the response object returned from the Node/HTTP
 *  request
 * @param {Request} request the request object used to make this API call
 *
 * @property {number} statusCode the HTTP status code for the response, if any
 * @property {string} body the raw body received from the API
 * @property {Object} result the parsed JSON received from the API
 * @property {Object} data the data attribute taken from the result
 * @property {boolean} parsed wether the raw body has been parsed into JSON
 * @property {Request} request the request object used to make this API call
 * @property {Error} error the error that could have been thrown by the onError method in the listener class
 *
 */
declare class Response<T = unknown, K = unknown> implements IResponse<T, K> {
	headers: IncomingHttpHeaders;
	statusCode: number | undefined;
	body: string;
	result: T | null;
	data: K | null;
	parsed: boolean;
	request: Request;
	private error;
	constructor(http_response: IncomingMessage | Error, request: Request);
	/**
	 * Add a chunk received from the API to the body
	 *
	 * @param {string} chunk a chunk of data
	 * @public
	 */
	addChunk(chunk: string): void;
	/**
	 * Tries to parse the raw data
	 * @public
	 */
	parse(): void;
	/**
	 * Whether this API call can be considered a success. Used to wrap the response
	 * into a ResponseError
	 *
	 * @return {boolean}
	 * @public
	 */
	success(): boolean;
	/**
	 * Tests if the content is seemingly JSON
	 *
	 * @return {boolean}
	 * @private
	 */
	private isJson;
	/**
	 * This method return only the data that the user needs,
	 * and removes the ablility to use any of the public methods that can be used to manipulate the response.
	 * It returns the response with 'result' and 'data' being possibly null that's the only difference between it and returnResponseSuccess method.
	 *
	 * @return {ReturnedResponseError}
	 * @public
	 */
	returnResponseError(): ReturnedResponseError;
	/**
	 * This method return only the data that the user needs,
	 * and removes the ablility to use any of the public methods that can be used to manipulate the response.
	 *
	 * @return {ReturnedResponseSuccess}
	 * @public
	 */
	returnResponseSuccess(): ReturnedResponseSuccess<T, K>;
}

interface IResponse<T, K> {
	headers: IncomingHttpHeaders;
	statusCode: number | undefined;
	body: string;
	result: T | null;
	data: K | null;
	parsed: boolean;
	request: Request;
}
type ReturnedResponseError<T = unknown, K = unknown> = Omit<
	Response<T, K>,
	'addChunk' | 'parse' | 'success' | 'returnResponseError' | 'returnResponseSuccess' | 'error'
>;
type ReturnedResponseSuccess<T, K> = Omit<
	ReturnedResponseError<T, K>,
	'result' | 'data' | 'statusCode'
> & {
	statusCode: number;
	result: T;
	data: K;
};

/**
 * A convenient wrapper around the API, allowing for generic, authenticated and
 * unauthenticated API calls without having to manage the serialization,
 * desrialization, and authentication.
 *
 * Generally you do not need to use this object directly. Instead it is used
 * indirectly by the various namespaced methods for every API call.
 *
 * For example, the following are the semantically the same.
 *
 * ```ts
 * amadeus.client.get('/v1/reference-data/urls/checkin-links', options);
 * amadeus.amadeus.reference_data.urls.checkin_links.get(options);
 * ```
 *
 * @param {Options} options a list of options. See {@link Amadeus} .
 * @property {string} clientId the API key used to authenticate the API
 * @property {string} clientSecret the API secret used to authenticate
 *  the API
 * @property {Console} logger the `console`-compatible logger used to debug calls
 * @property {LogLevel} logLevel the log level for the client, available options
 *  are `debug`, `warn`, and `silent`. Defaults to 'silent'
 * @property {string} host the hostname of the server API calls are made to
 * @property {number} port the port the server API calls are made to
 * @property {boolean} ssl wether an SSL request is made to the server
 * @property {string} customAppId the custom App ID to be passed in the User
 *  Agent to the server
 * @property {string} customAppVersion the custom App Version number to be
 *  passed in the User Agent to the server
 * @property {Object} http the Node/HTTP(S)-compatible client used to make
 *  requests
 * @property {string} version The version of this API client
 */
declare class Client implements Options {
	private accessToken;
	version: string;
	clientId: string;
	clientSecret: string;
	logger: Console;
	logLevel: LogLevel;
	hostname: Hostname;
	host: string;
	ssl: boolean;
	port: number;
	http: Network;
	customAppId?: string;
	customAppVersion?: string;
	constructor(options?: Options);
	/**
	 * Make an authenticated GET API call.
	 *
	 * ```ts
	 * amadeus.client.get('/v2/foo/bar', { some: 'data' });
	 * ```
	 * @param {string} path the full path of the API endpoint
	 * @param {Object} [params={}] the query string parameters
	 * @return {Promise<Response|ResponseError>} a Promise
	 */
	get<T, K = unknown>(path: string, params?: object): Promise<ReturnedResponseSuccess<T, K>>;
	/**
	 * Make an authenticated POST API call.
	 *
	 * ```ts
	 * amadeus.client.post('/v2/foo/bar', { some: 'data' });
	 * ```
	 * @param {string} path the full path of the API endpoint
	 * @param {Object} [params={}] the POST parameters
	 * @return {Promise<Response|ResponseError>} a Promise
	 */
	post<T, K = unknown>(
		path: string,
		params?: object | string
	): Promise<ReturnedResponseSuccess<T, K>>;
	/**
	 * Make an authenticated DELETE API call.
	 *
	 * ```ts
	 * amadeus.client.delete('/v2/foo/bar', { some: 'data' });
	 * ```
	 * @param {string} path the full path of the API endpoint
	 * @param {Object} [params={}] the query string parameters
	 * @return {Promise<Response|ResponseError>} a Promise
	 */
	delete<T, K>(path: string, params?: object): Promise<ReturnedResponseSuccess<T, K>>;
	/**
	 * Make an authenticated API call.
	 *
	 * ```ts
	 * amadeus.client.call('GET', '/v2/foo/bar', { some: 'data' });
	 * ```
	 * @param {Verb} verb the HTTP method, for example `GET` or `POST`
	 * @param {string} path the full path of the API endpoint
	 * @param {Object} [params={}] the POST parameters
	 * @return {Promise<Response|ResponseError>} a Promise
	 * @public
	 */
	request<T, K>(
		verb: Verb,
		path: string,
		params?: object | string
	): Promise<ReturnedResponseSuccess<T, K>>;
	/**
	 * Make any kind of API call, authenticated or not
	 *
	 * Used by the .get, .post methods to make API calls.
	 *
	 * Sets up a new Promise and then excutes the API call, triggering the Promise
	 * to be called when the API call fails or succeeds.
	 *
	 * @param {Verb} verb the HTTP method, for example `GET` or `POST`
	 * @param {string} path the full path of the API endpoint
	 * @param {Object} params the parameters to pass in the query or body
	 * @param {string} [bearerToken=null] the BearerToken as generated by the
	 *  AccessToken class
	 * @return {Promise<Response|ResponseError>} a Promise
	 * @public
	 */
	unauthenticatedRequest<T, K>(
		verb: Verb,
		path: string,
		params?: object | string,
		bearerToken?: string | null
	): Promise<ReturnedResponseSuccess<T, K>>;
	/**
	 * Actually executes the API call.
	 *
	 * @param {Request} request the request to execute
	 * @param {EventEmitter} emitter the event emitter to notify of changes
	 * @private
	 */
	private execute;
	/**
	 * Builds a Request object to be used in the API call
	 *
	 * @param {Verb} verb the HTTP method, for example `GET` or `POST`
	 * @param {string} path the full path of the API endpoint
	 * @param {Object} params the parameters to pass in the query or body
	 * @param {string} [bearerToken=null] the BearerToken as generated by the
	 *  AccessToken class
	 * @return {Request}
	 * @private
	 */
	private buildRequest;
	/**
	 * Builds a Promise to be returned to the API user
	 *
	 * @param  {EventEmitter} emitter the event emitter to notify of changes
	 * @return {Promise} a promise
	 * @private
	 */
	private buildPromise;
	/**
	 * Logs the request, when in debug mode
	 *
	 * @param {Request} request the request object to log
	 * @public
	 */
	log(request: Request): void;
	/**
	 * Determines if this client is in debug mode
	 *
	 * @return {boolean}
	 */
	debug(): boolean;
	/**
	 * Determines if this client is in warn or debug mode
	 *
	 * @return {boolean}
	 */
	warn(): boolean;
}

/**
 * A namespaced client for the
 * `/v1/reference-data/airlines` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.airlines;
 * ```
 *
 * @param {Client} client
 */
declare class Airlines {
	private client;
	constructor(client: Client);
	/**
	 * Returns the airline name and code.
	 *
	 * @param {Object} params
	 * @param {string} params.airlineCodes Code of the airline following IATA or ICAO standard.
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find to which airlines belongs IATA Code BA
	 *
	 * ```ts
	 * amadeus.referenceData.airlines.get({
	 *   airlineCodes : 'BA'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v2/reference-data/locations/:location_id` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations('ALHR');
 * ```
 *
 * @param {Client} client
 * @property {number} locationId
 */
declare class Location$1 {
	private client;
	private locationId;
	constructor(client: Client, locationId: string);
	/**
	 * Returns details for a specific airport
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find details for location with ID 'ALHR'
	 *
	 * ```ts
	 * amadeus.referenceData.location('ALHR').get();
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v2/reference-data/locations/airports` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations.airports;
 * ```
 *
 * @param {Client} client
 */
declare class Airports {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of relevant airports near to a given point.
	 *
	 * @param {Object} params
	 * @param {number} params.latitude latitude location to be at the center of
	 *   the search circle - required
	 * @param {number} params.longitude longitude location to be at the center of
	 *   the search circle - required
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find the nearest airport to the 49.0000,2.55 lat/long
	 *
	 * ```ts
	 * amadeus.referenceData.locations.airports.get({
	 *   longitude: 49.0000,
	 *   latitude: 2.55
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v2/reference-data/locations/cities` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * cosnt amadeus = new Amadeus();
 * amadeus.referenceData.locations.cities;
 * ```
 *
 * @param {Client} client
 */
declare class Cities {
	private client;
	constructor(client: Client);
	/**
	 * Return a list of cities matching a given keyword..
	 *
	 * @param {Object} params
	 * @param {string} params.keyword keyword that should represent
	 * the start of a word in a city name
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Return a list of cities matching a keyword 'France'
	 *
	 * ```ts
	 * amadeus.referenceData.locations.cities.get({
	 *   keyword: 'FRANCE'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/reference-data/locations/hotel` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations.hotel;
 * ```
 *
 * @param {Client} client
 */
declare class Hotel {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of hotels for a given area.
	 *
	 * @param {Object} params
	 * @param {string} params.keyword Location query keyword Example: PARI
	 * @param {string} params.subType Category of search - To enter several value, repeat the query parameter    * Use HOTEL_LEISURE to target aggregators or HOTEL_GDS to target directly the chains
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 *  Find relevant points of interest within an area in Barcelona
	 * ```ts
	 * amadeus.referenceData.locations.hotel.get({
	 *   keyword: 'PARI',
	 *   subType: 'HOTEL_GDS'
	 * })
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/reference-data/locations/hotels/by-city` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations.hotels.byCity;
 * ```
 *
 * @param {Client} client
 */
declare class byCity {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of hotels for a given area.
	 *
	 * @param {Object} params
	 * @param {string} params.cityCode City IATA code
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find list of hotels in Barcelona
	 *
	 * ```ts
	 * amadeus.referenceData.locations.hotels.byCity.get({
	 *   cityCode: 'BCN'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/reference-data/locations/hotels/by-geocode` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations.hotels.byGeocode;
 * ```
 *
 * @param {Client} client
 */
declare class byGeocode {
	private client;
	constructor(client: Client);
	/**
     *  Returns a list of hotels for a given area.
     *
     * @param {Object} params
     * @param {number} params.latitude latitude location to be at the center of
     * the search circle - required
     * @param {number} params.longitude longitude location to be at the center of
     * the search circle - required
     * @return {Promise<Response|ResponseError>} a Promise
     *
     *  Returns a list of hotels within an area in Barcelona
     *
     * ```ts
     * amadeus.referenceData.locations.hotels.byGeocode.get({
        latitude: 48.83152,
        longitude: 2.24691
     * });
     * ```
     */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/reference-data/locations/hotels/by-hotels` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations.hotels.byHotels;
 * ```
 *
 * @param {Client} client
 */
declare class byHotels {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of hotels for a given area.
	 *
	 * @param {Object} params
	 * @param {string} params.hotelIds Comma separated list of Amadeus hotel
	 *   codes to request. Example: XKPARC12
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find relevant points of interest within an area in Barcelona
	 * ```ts
	 * amadeus.referenceData.locations.hotels.byHotels.get({
	 *   hotelIds: 'ACPAR245'
	 * })
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/reference-data/locations/hotels` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations.hotels;
 * ```
 *
 * @param {Client} client
 */
declare class Hotels {
	private client;
	byCity: byCity;
	byGeocode: byGeocode;
	byHotels: byHotels;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v1/reference-data/locations/pois/by-square` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations.pointsOfInterest.bySquare;
 * ```
 *
 * @param {Client} client
 */
declare class BySquare$1 {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of relevant points of interest for a given area.
	 *
	 * @param {Object} params
	 * @param {number} params.north latitude north of bounding box - required
	 * @param {number} params.west  longitude west of bounding box - required
	 * @param {number} params.south latitude south of bounding box - required
	 * @param {number} params.east  longitude east of bounding box - required
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find relevant points of interest within an area in Barcelona
	 *
	 * ```ts
	 * amadeus.referenceData.locations.pointsOfInterest.bySquare.get({
	 *   north: 41.397158,
	 *   west: 2.160873,
	 *   south: 41.394582,
	 *   east: 2.177181
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/reference-data/locations/pois` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations.pointsOfInterest;
 * ```
 *
 * @param {Client} client
 */
declare class PointsOfInterest {
	private client;
	bySquare: BySquare$1;
	constructor(client: Client);
	/**
	 * Returns a list of relevant points of interest near to a given point
	 *
	 * @param {Object} params
	 * @param {number} params.latitude latitude location to be at the center of
	 *   the search circle - required
	 * @param {number} params.longitude longitude location to be at the center of
	 *   the search circle - required
	 * @param {number} params.radius radius of the search in Kilometer - optional
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find relevant points of interest close to Barcelona
	 *
	 * ```ts
	 * amadeus.referenceData.locations.pointsOfInterest.get({
	 *   longitude: 2.160873,
	 *   latitude: 41.397158
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/reference-data/locations/pois` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations.pointOfInterest;
 * ```
 *
 * @param {Client} client
 */
declare class PointOfInterest {
	private client;
	private poiId;
	constructor(client: Client, poiId: string);
	/**
	 * Extracts the information about point of interest with given ID
	 *
	 * Extract the information about point of interest with ID '9CB40CB5D0'
	 * ```ts
	 * amadeus.referenceData.locations.pointOfInterest('9CB40CB5D0').get();
	 * ```
	 */
	get(): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v2/reference-data/locations` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.locations;
 * ```
 *
 * @param {Client} client
 * @property {Airports} airports
 */
declare class Locations {
	private client;
	airports: Airports;
	cities: Cities;
	hotel: Hotel;
	hotels: Hotels;
	pointsOfInterest: PointsOfInterest;
	constructor(client: Client);
	/**
	 * Returns a list of airports and cities matching a given keyword.
	 *
	 * @param {Object} params
	 * @param {string} params.keyword keyword that should represent the start of
	 *   a word in a city or airport name or code
	 * @param {string} params.subType the type of location to search for
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find any location starting with 'lon'
	 *
	 * ```ts
	 * amadeus.referenceData.locations.get({
	 *   keyword: 'lon',
	 *   subType: Amadeus.location.any
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
	pointOfInterest(poiId: string): PointOfInterest;
}

/**
 * A namespaced client for the
 * `/v1/reference-data/recommended-locations` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.recommendedLocations;
 * ```
 *
 * @param {Client} client
 */
declare class RecommendedLocations {
	private client;
	constructor(client: Client);
	/**
	 * Returns the recommended locations (destinations).
	 *
	 * @param {Object} params
	 * @param {string} params.cityCodes Code of the city following IATA standard.
	 * @param {string} params.travelerCountryCode Origin country of the traveler following IATA standard.
	 * @param {string} params.destinationCountryCodes Country codes follow IATA standard.
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Get recommended destinations from a given origin
	 *
	 * ```ts
	 * amadeus.referenceData.recommendedDestinations.get({
	 *   cityCodes: 'PAR',
	 *   travelerCountryCode: 'FR'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v2/reference-data/urls/checkin-links` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.urls.checkinLinks;
 * ```
 *
 * @param {Client} client
 */
declare class CheckinLinks {
	private client;
	constructor(client: Client);
	/**
	 * Returns the checkin links for an airline, for the
	 * language of your choice
	 *
	 * @param {Object} params
	 * @param {string} params.airlineCode airline ID - required
	 * @param {string} [params.language="en-GB"] the locale for the links
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find a the checkin links for Air France
	 *
	 * ```ts
	 * amadeus.referenceData.urls.checkinLinks.get({
	 *   airlineCode: 'AF'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v2/reference-data/urls` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.urls;
 * ```
 *
 * @param {Client} client
 * @property {CheckinLinks} checkin_links
 * @protected
 */
declare class Urls {
	private client;
	checkinLinks: CheckinLinks;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v2/reference-data` endpoints
 *
 * Access via the {Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.referenceData.urls;
 * ```
 *
 * @param {Client} client
 * @property {Urls} urls
 * @protected
 */
declare class ReferenceData {
	private client;
	urls: Urls;
	locations: Locations;
	airlines: Airlines;
	recommendedLocations: RecommendedLocations;
	constructor(client: Client);
	/**
	 * The namespace for the Location APIs - accessing a specific location
	 *
	 * @param  {string} [locationId] The ID of the location to search for
	 * @return {Location}
	 **/
	location(locationId: string): Location$1;
}

/**
 * A namespaced client for the
 * `/v1/shopping/activities/by-square` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.activities.bySquare;
 * ```
 *
 * @param {Client} client
 */
declare class BySquare {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of tours and activities a given area.
	 *
	 * @param {Object} params
	 * @param {number} params.north latitude north of bounding box - required
	 * @param {number} params.west  longitude west of bounding box - required
	 * @param {number} params.south latitude south of bounding box - required
	 * @param {number} params.east  longitude east of bounding box - required
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find relevant tours and activities within an area in Barcelona
	 *
	 * ```ts
	 * amadeus.shopping.activities.bySquare.get({
	 *   north: 41.397158,
	 *   west: 2.160873,
	 *   south: 41.394582,
	 *   east: 2.177181
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/shopping/activities` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.activities
 * ```
 *
 * @param {Client} client
 */
declare class Activities {
	private client;
	bySquare: BySquare;
	constructor(client: Client);
	/**
	 * /shopping/activities
	 *
	 * @param {Object} params
	 * @param {number} params.latitude latitude location to be at the center of
	 *   the search circle - required
	 * @param {number} params.longitude longitude location to be at the center of
	 *   the search circle - required
	 * @param {number} params.radius radius of the search in Kilometer - optional
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * What are the best tours and activities in Barcelona? (based a geo location and a radius)
	 *
	 * ```ts
	 * amadeus.shopping.activities.get({
	 *   longitude: 2.160873,
	 *   latitude: 41.397158
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/shopping/activities/{activityId}` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.activity
 * ```
 *
 * @param {Client} client
 */
declare class Activity {
	private client;
	private activityId;
	constructor(client: Client, activityId: string);
	/**
	 * Retieve information of an activity by its Id.
	 *
	 * What is the activity information with Id 3216547684?
	 * ```ts
	 * amadeus.shopping.activity('3216547684').get();
	 * ```
	 */
	get(): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/shopping/availability/flight-availabilities` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.availability.flightAvailabilities;
 * ```
 *
 * @param {Client} client
 */
declare class FlightAvailabilities {
	private client;
	constructor(client: Client);
	/**
	 * Get available seats in different fare classes
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * ```ts
	 * amadeus.shopping.availability.flightAvailabilities.post(body);
	 * ```
	 */
	post(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/shopping/availability` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.availability;
 * ```
 *
 * @param {Client} client
 * @property {Availability} availability
 * @protected
 */
declare class Availability {
	private client;
	flightAvailabilities: FlightAvailabilities;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v1/shopping/flight-dates` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.flightDates;
 * ```
 *
 * @param {Client} client
 */
declare class FlightDates {
	private client;
	constructor(client: Client);
	/**
	 * Find the cheapest flight dates from an origin to a destination.
	 *
	 * @param {Object} params
	 * @param {string} params.origin City/Airport IATA code from which the flight
	 *   will depart. BOS, for example.
	 * @param {string} params.destination City/Airport IATA code to which the
	 *   traveler is going. PAR, for example
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find the cheapest flight dates from New-York to Madrid
	 *
	 * ```ts
	 * amadeus.shopping.flightDates.get({
	 *   origin: 'NYC',
	 *   destination: 'MAD'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/shopping/flight-destinations` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.flightDestinations;
 * ```
 *
 * @param {Client} client
 */
declare class FlightDestinations {
	private client;
	constructor(client: Client);
	/**
	 * Find the cheapest destinations where you can fly to.
	 *
	 * @param {Object} params
	 * @param {string} params.origin City/Airport IATA code from which the flight
	 *   will depart. BOS, for example.
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find the cheapest destination from Madrid
	 *
	 * ```ts
	 * amadeus.shopping.flightDestinations.get({
	 *   origin: 'MAD'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

interface Issue {
	status?: number;
	code?: number;
	title?: string;
	detail?: string;
	source?: {
		pointer?: string;
		parameter?: string;
		example?: string;
	};
}
interface CollectionMeta {
	count?: number;
	oneWayCombinations?: {
		originDestinationId?: string;
		flightOfferIds?: string[];
	}[];
}
interface CollectionMetaLink {
	count?: number;
	links?: {
		self?: string;
		next?: string;
		previous?: string;
		last?: string;
		first?: string;
		up?: string;
	};
}
type LocationEntry = {
	[key: string]: LocationValue;
};
type AircraftEntry = {
	[key: string]: string;
};
type CurrencyEntry = {
	[key: string]: string;
};
type CarrierEntry = {
	[key: string]: string;
};
interface FlightSegment {
	departure?: FlightEndPoint;
	arrival?: FlightEndPoint;
	carrierCode?: string;
	number?: string;
	aircraft?: AircraftEquipment;
	operating?: OperatingFlight$1;
	duration?: string;
	stops?: FlightStop[];
}
interface FlightEndPoint {
	iataCode?: string;
	terminal?: string;
	at?: string;
}
interface OriginalFlightStop {
	iataCode?: string;
	duration?: string;
}
type FlightStop = OriginalFlightStop & {
	arrivalAt?: string;
	departureAt?: string;
};
interface AircraftEquipment {
	code?: string;
}
interface OperatingFlight$1 {
	carrierCode?: string;
}
interface Price$1 {
	currency?: string;
	total?: string;
	base?: string;
	fees?: Fee[];
	taxes?: Tax[];
	refundableTaxes?: string;
}
type ExtendedPrice = {
	margin?: string;
	grandTotal?: string;
	billingCurrency?: string;
	additionalServices?: {
		amount?: string;
		type?: AdditionalServiceType;
	}[];
} & Price$1;
type AdditionalServiceType = 'CHECKED_BAGS' | 'MEALS' | 'SEATS' | 'OTHER_SERVICES';
interface Fee {
	amount?: string;
	type?: FeeType;
}
type FeeType = 'TICKETING' | 'FORM_OF_PAYMENT' | 'SUPPLIER';
interface Tax {
	amount?: string;
	code?: string;
}
interface Co2Emission {
	weight?: number;
	weightUnit?: string;
	cabin?: TravelClass;
}
type TravelClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export interface FlightOffer$1 {
	type: string;
	id: string;
	source?: FlightOfferSource;
	instantTicketingRequired?: boolean;
	disablePricing?: boolean;
	nonHomogeneous?: boolean;
	oneWay?: boolean;
	paymentCardRequired?: boolean;
	lastTicketingDate?: string;
	lastTicketingDateTime?: string;
	numberOfBookableSeats?: number;
	itineraries?: {
		duration?: string;
		segments: Segment[];
	}[];
	price?: ExtendedPrice;
	pricingOptions?: {
		fareType?: PricingOptionsFareType;
		includedCheckedBagsOnly?: boolean;
		refundableFare?: boolean;
		noRestrictionFare?: boolean;
		noPenaltyFare?: boolean;
	};
	validatingAirlineCodes?: string[];
	travelerPricings?: {
		travelerId: string;
		fareOption: TravelerPricingFareOption;
		travelerType: TravelerType;
		associatedAdultId?: string;
		price?: Price$1;
		fareDetailsBySegment: {
			segmentId: string;
			cabin?: TravelClass;
			fareBasis?: string;
			brandedFare?: string;
			class?: string;
			isAllotment?: boolean;
			allotmentDetails?: AllotmentDetails;
			sliceDiceIndicator?: SliceDiceIndicator;
			includedCheckedBags?: BaggageAllowance$1;
			additionalServices?: {
				chargeableCheckedBags?: ChargeableCheckdBags;
				chargeableSeat?: ChargeableSeat;
				chargeableSeatNumber?: string;
				otherServices?: ServiceName[];
			};
		}[];
	}[];
}
type Segment = {
	id?: string;
	numberOfStops?: number;
	blacklistedInEU?: boolean;
	co2Emissions?: Co2Emission[];
} & FlightSegment;
type TravelerType =
	| 'ADULT'
	| 'CHILD'
	| 'SENIOR'
	| 'YOUNG'
	| 'HELD_INFANT'
	| 'SEATED_INFANT'
	| 'STUDENT';
type FlightOfferSource = 'GDS';
type TravelerPricingFareOption =
	| 'STANDARD'
	| 'INCLUSIVE_TOUR'
	| 'SPANISH_MELILLA_RESIDENT'
	| 'SPANISH_CEUTA_RESIDENT'
	| 'SPANISH_CANARY_RESIDENT'
	| 'SPANISH_BALEARIC_RESIDENT'
	| 'AIR_FRANCE_METROPOLITAN_DISCOUNT_PASS'
	| 'AIR_FRANCE_DOM_DISCOUNT_PASS'
	| 'AIR_FRANCE_COMBINED_DISCOUNT_PASS'
	| 'AIR_FRANCE_FAMILY'
	| 'ADULT_WITH_COMPANION'
	| 'COMPANION';
type SliceDiceIndicator = 'LOCAL_AVAILABILITY' | 'SUB_OD_AVAILABILITY_1' | 'SUB_OD_AVAILABILITY_2';
interface Dictionaries$1 {
	locations?: LocationEntry;
	aircraft?: AircraftEntry;
	currencies?: CurrencyEntry;
	carriers?: CarrierEntry;
}
interface LocationValue {
	cityCode?: string;
	countryCode?: string;
}
interface LocationValue {
	cityCode?: string;
	countryCode?: string;
}
interface AllotmentDetails {
	tourName?: string;
	tourReference?: string;
}
type ChargeableCheckdBags = BaggageAllowance$1 & {
	id?: string;
};
interface ChargeableSeat {
	id?: string;
	number?: string;
}
interface BaggageAllowance$1 {
	quantity?: number;
	weight?: number;
	weightUnit?: string;
}
type ServiceName = 'PRIORITY_BOARDING' | 'AIRPORT_CHECKIN';
type PricingOptionsFareType = ('PUBLISHED' | 'NEGOTIATED' | 'CORPORATE')[];
interface Stakeholder {
	id?: string;
	dateOfBirth?: string;
	gender?: StakeholderGender;
	name?: Name;
	documents?: IdentityDocument[];
}
type StakeholderGender = 'MALE' | 'FEMALE';
type IdentityDocument = Document & {
	documentType?: DocumentType;
	validityCountry?: string;
	birthCountry?: string;
	holder?: boolean;
};
interface Document {
	number?: string;
	issuanceDate?: string;
	expiryDate?: string;
	issuanceCountry?: string;
	issuanceLocation?: string;
	nationality?: string;
	birthPlace?: string;
}
type DocumentType = 'VISA' | 'PASSPORT' | 'IDENTITY_CARD' | 'KNOWN_TRAVELER' | 'REDRESS';
interface EmergencyContact {
	addresseeName?: string;
	countryCode?: string;
	number?: string;
	text?: string;
}
interface LoyaltyProgram {
	programOwner?: string;
	id?: string;
}
interface Discount {
	subType?: DiscountType;
	cityName?: string;
	travelerType?: DiscountTravelerType;
	cardNumber?: string;
	certificateNumber?: string;
}
type DiscountType =
	| 'SPANISH_RESIDENT'
	| 'AIR_FRANCE_DOMESTIC'
	| 'AIR_FRANCE_COMBINED'
	| 'AIR_FRANCE_METROPOLITAN';
type DiscountTravelerType =
	| 'SPANISH_CITIZEN'
	| 'EUROPEAN_CITIZEN'
	| 'GOVERNMENT_WORKER'
	| 'MILITARY'
	| 'MINOR_WITHOUT_ID';
type Name = BaseName & {
	secondLastName?: string;
};
interface BaseName {
	firstName?: string;
	lastName?: string;
	middleName?: string;
}
interface ElementaryPrice {
	amount?: string;
	currencyCode?: string;
}
type Traveler = Stakeholder & {
	emergencyContact?: EmergencyContact;
	loyaltyPrograms?: LoyaltyProgram[];
	discountEligibility?: Discount[];
	contact?: Contact;
};
type Contact = ContactDictionary & {
	phones?: Phone[];
	companyName?: string;
	emailAddress?: string;
};
type ContactPurpose = 'STANDARD' | 'INVOICE' | 'STANDARD_WITHOUT_TRANSMISSION';
interface ContactDictionary {
	addresseeName?: Name;
	address?: Address;
	language?: string;
	purpose?: ContactPurpose;
}
interface Address {
	lines?: string[];
	postalCode?: string;
	countryCode?: string;
	cityName?: string;
	stateName?: string;
	postalBox?: string;
}
interface Phone {
	deviceType?: PhoneDeviceType;
	countryCallingCode?: string;
	number?: string;
}
type PhoneDeviceType = 'MOBILE' | 'LANDLINE' | 'FAX';
interface Remarks {
	general?: GeneralRemark[];
	airline?: AirlineRemark[];
}
interface GeneralRemark {
	subType: GeneralRemarkType;
	category?: string;
	text: string;
	travelerIds?: string[];
	flightOfferIds?: string[];
}
type GeneralRemarkType =
	| 'GENERAL_MISCELLANEOUS'
	| 'CONFIDENTIAL'
	| 'INVOICE'
	| 'QUALITY_CONTROL'
	| 'BACKOFFICE'
	| 'FULFILLMENT'
	| 'ITINERARY'
	| 'TICKETING_MISCELLANEOUS'
	| 'TOUR_CODE';
interface AirlineRemark {
	subType: AirlineRemarkType;
	keyword?: string;
	airlineCode: string;
	text: string;
	travelerIds?: string[];
	flightOfferIds?: string[];
}
type AirlineRemarkType =
	| 'OTHER_SERVICE_INFORMATION'
	| 'KEYWORD'
	| 'OTHER_SERVICE'
	| 'CLIENT_ID'
	| 'ADVANCED_TICKET_TIME_LIMIT';
interface TicketingAgreement {
	option?: TicketingAgreementOption;
	delay?: string;
	dateTime?: string;
	segmentIds?: string[];
}
type TicketingAgreementOption = 'CONFIRM' | 'DELAY_TO_QUEUE' | 'DELAY_TO_CANCEL';
interface AssociatedRecordCommon {
	reference?: string;
	creationDate?: string;
	originSystemCode?: string;
}
type AssociatedRecord = AssociatedRecordCommon & {
	flightOfferId?: string;
};
interface FlightOrder$1 {
	type: 'flight-order';
	id?: string;
	queuingOfficeId?: string;
	ownerOfficeId?: string;
	associatedRecords?: AssociatedRecord[];
	flightOffers: FlightOffer$1[];
	travelers?: Traveler[];
	remarks?: Remarks;
	formOfPayments?: FormOfPayment[];
	ticketingAgreement?: TicketingAgreement;
	automatedProcess?: AutomatedProcess[];
	contacts?: Contact[];
	tickets?: AirTravelDocument[];
	formOfIdentifications?: FormOfIdentification[];
}
interface FormOfIdentification {
	identificationType?:
		| 'DRIVERS_LICENSE'
		| 'PASSPORT'
		| 'NATIONAL_IDENTITY_CARD'
		| 'BOOKING_CONFIRMATION'
		| 'TICKET'
		| 'OTHER_ID';
	carrierCode?: string;
	number?: string;
	travelerIds?: string[];
	flightOfferIds?: string[];
}
interface AutomatedProcessCommon {
	code?: AutomatedProcessCode;
	queue?: {
		number?: string;
		category?: string;
	};
	text?: string;
}
type AutomatedProcess = AutomatedProcessCommon & {
	delay?: string;
	officeId?: string;
	dateTime?: string;
};
type AutomatedProcessCode = 'IMMEDIATE' | 'DELAYED' | 'ERROR';
interface FormOfPayment {
	b2bWallet?: B2BWallet;
	creditCard?: CreditCard;
	other?: OtherMethod;
}
interface B2BWallet {
	cardId?: string;
	cardUsageName?: string;
	cardFriendlyName?: string;
	reportingData?: {
		name?: string;
		value?: string;
	}[];
	virtualCreditCardDetails?: VirtualCreditCardDetails;
	flightOfferIds?: string[];
}
type VirtualCreditCardDetails = CreditCardCommon & ElementaryPrice;
type CreditCard = CreditCardCommon & {
	securityCode?: string;
	flightOfferIds?: string[];
};
interface CreditCardCommon {
	brand?: CreditCardBrand;
	holder?: string;
	number?: string;
	expiryDate?: string;
}
type CreditCardBrand =
	| 'VISA'
	| 'AMERICAN_EXPRESS'
	| 'MASTERCARD'
	| 'VISA_ELECTRON'
	| 'VISA_DEBIT'
	| 'MASTERCARD_DEBIT'
	| 'MAESTRO'
	| 'DINERS'
	| 'EASYPAY';
interface OtherMethod {
	method?: OtherPaymentMethod;
	flightOfferIds?: string[];
}
type OtherPaymentMethod = 'ACCOUNT' | 'CHECK' | 'CASH' | 'NONREFUNDABLE';
type AirTravelDocument = AirTravelDocumentCommon & {
	travelerId?: string;
	segmentIds?: string[];
};
interface AirTravelDocumentCommon {
	documentType?: 'ETICKET' | 'PTICKET' | 'EMD' | 'MCO';
	documentNumber?: string;
	documentStatus?: 'ISSUED' | 'REFUNDED' | 'VOID' | 'ORIGINAL' | 'EXCHANGED';
}
interface FareRules {
	currency?: string;
	rules?: TermAndCondition[];
}
interface TermAndCondition {
	category?: 'REFUND' | 'EXCHANGE' | 'REVALIDATION' | 'REISSUE' | 'REBOOK' | 'CANCELLATION';
	circumstances?: string;
	notApplicable?: boolean;
	maxPenaltyAmount?: string;
	descriptions?: {
		descriptionType?: string;
		text?: string;
	}[];
}

type UtilRequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
type OriginDestination = OriginDestinationLight & {
	originRadius?: number;
	alternativeOriginsCodes?: string[];
	destinationRadius?: number;
	alternativeDestinationsCodes?: string[];
	departureDateTimeRange?: DateTimeRange;
	arrivalDateTimeRange?: DateTimeRange;
};
interface OriginDestinationLight {
	id?: string;
	originLocationCode?: string;
	destinationLocationCode?: string;
	includedConnectionPoints?: string[];
	excludedConnectionPoints?: string[];
}
type DateTimeRange = UtilRequiredKeys<DateTimeType, 'date'> & {
	dateWindow?: string;
	timeWindow?: string;
};
interface DateTimeType {
	date: string;
	time?: string;
}
type ExtendedTravelerInfo = UtilRequiredKeys<TravelerInfo, 'id' | 'travelerType'>;
interface TravelerInfo {
	id: string;
	travelerType: TravelerType;
	associatedAdultId?: string;
}
interface SearchCriteria {
	excludeAllotments?: boolean;
	addOneWayOffers?: boolean;
	maxFlightOffers?: number;
	maxPrice?: number;
	allowAlternativeFareOptions?: boolean;
	oneFlightOfferPerDay?: boolean;
	additionalInformation?: {
		chargeableCheckedBags?: boolean;
		brandedFares?: boolean;
	};
	pricingOptions?: ExtendedPricingOptions;
	flightFilters?: FlightFilters;
}
interface CabinRestriction {
	cabin?: TravelClass;
	originDestinationIds?: string[];
}
type ExtendedCabinRestriction = CabinRestriction & {
	coverage?: Coverage;
};
interface FlightFilters {
	crossBorderAllowed?: boolean;
	moreOvernightsAllowed?: boolean;
	returnToDepartureAirport?: boolean;
	railSegmentAllowed?: boolean;
	busSegmentAllowed?: boolean;
	maxFlightTime?: number;
	carrierRestrictions?: CarrierRestrictions;
	cabinRestrictions?: ExtendedCabinRestriction[];
	connectionRestriction?: ConnectionRestriction;
}
interface CarrierRestrictions {
	blacklistedInEUAllowed?: boolean;
	excludedCarrierCodes?: string[];
	includedCarrierCodes?: string[];
}
interface ConnectionRestriction {
	maxNumberOfConnections?: number;
	nonStopPreferred?: boolean;
	airportChangeAllowed?: boolean;
	technicalStopsAllowed?: boolean;
}
interface ExtendedPricingOptions {
	includedCheckedBagsOnly?: boolean;
	refundableFare?: boolean;
	noRestrictionFare?: boolean;
	noPenaltyFare?: boolean;
}
type Coverage = 'MOST_SEGMENTS' | 'AT_LEAST_ONE_SEGMENT' | 'ALL_SEGMENTS';
type FlightOffersSearchPostParams = {
	currencyCode?: string;
	originDestinations: OriginDestination[];
	travelers: ExtendedTravelerInfo[];
	sources: FlightOfferSource[];
	searchCriteria?: SearchCriteria;
};
type FlightOffersSearchPostResult = {
	meta: CollectionMeta;
	warnings?: Issue[];
	data: FlightOffer$1[];
	dictionaries: Dictionaries$1;
};
type FlightOffersSearchGetParams = {
	originLocationCode: string;
	destinationLocationCode: string;
	departureDate: string;
	returnDate?: string;
	adults: number;
	children?: number;
	infants?: number;
	travelClass?: TravelClass;
	includedAirlineCodes?: string;
	excludedAirlineCodes?: string;
	nonStop?: boolean;
	currencyCode?: string;
	maxPrice?: number;
	max?: number;
};
type FlightOffersSearchGetResult = {
	meta: CollectionMetaLink;
	warnings?: Issue[];
	data: FlightOffer$1[];
	dictionaries: Dictionaries$1;
};
type FlightOffersSearchGetReturnedResponse = Promise<
	ReturnedResponseSuccess<FlightOffersSearchGetResult, FlightOffersSearchGetResult['data']>
>;
type FlightOffersSearchPostReturnedResponse = Promise<
	ReturnedResponseSuccess<FlightOffersSearchPostResult, FlightOffersSearchPostResult['data']>
>;

/**
 * A namespaced client for the
 * `/v2/shopping/flight-offers` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.flightOffersSeach;
 * ```
 *
 * @param {Client} client
 */
declare class FlightOffersSearch {
	private client;
	constructor(client: Client);
	/**
	 * Get cheapest flight recommendations and prices on a given journey.
	 *
	 * @param {Object} params
	 * @param {string} params.originLocationCode city/airport IATA code from which the traveler will depart, e.g. BOS for Boston
	 * @param {string} params.destinationLocationCode city/airport IATA code to which the traveler is going, e.g. PAR for Paris
	 * @param {string} params.departureDate the date on which the traveler will depart
	 * from the origin to go to the destination. Dates are specified in the ISO 8601 YYYY-MM-DD format, e.g. 2017-12-25
	 * @param {string} params.adults the number of adult travelers (age 12 or older on date of departure)
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Get cheapest flight recommendations and prices for SYD-BKK on 2020-08-01 for 2 adults
	 *
	 * ```ts
	 * amadeus.shopping.flightOffers.get({
	 *    originLocationCode: 'SYD',
	 *    destinationLocationCode: 'BKK',
	 *    departureDate: '2020-08-01',
	 *    adults: '2'
	 * });
	 * ```
	 */
	get(params: FlightOffersSearchGetParams): FlightOffersSearchGetReturnedResponse;
	/**
     * To do a customized search with every option available.
     *
     * @param {FlightOffersSearchPostRequest} params
     * @param {number} params.getFlightOffersBody list of criteria to retrieve a list of flight offers
     * @return {Promise<Response|ResponseError>} a Promise
     *
     * To do a customized search with given options.
     *
     * ```ts
     * amadeus.shopping.flightOffersSearch.post({
          "currencyCode": "USD",
          "originDestinations": [
            {
              "id": "1",
              "originLocationCode": "RIO",
              "destinationLocationCode": "MAD",
              "departureDateTimeRange": {
                "date": "2020-03-01",
                "time": "10:00:00"
              }
            },
            {
              "id": "2",
              "originLocationCode": "MAD",
              "destinationLocationCode": "RIO",
              "departureDateTimeRange": {
                "date": "2020-03-05",
                "time": "17:00:00"
              }
            }
          ],
          "travelers": [
            {
              "id": "1",
              "travelerType": "ADULT",
              "fareOptions": [
                "STANDARD"
              ]
            },
            {
              "id": "2",
              "travelerType": "CHILD",
              "fareOptions": [
                "STANDARD"
              ]
            }
          ],
          "sources": [
            "GDS"
          ],
          "searchCriteria": {
            "maxFlightOffers": 50,
            "flightFilters": {
              "cabinRestrictions": [
                {
                  "cabin": "BUSINESS",
                  "coverage": "MOST_SEGMENTS",
                  "originDestinationIds": [
                    "1"
                  ]
                }
              ],
              "carrierRestrictions": {
                "excludedCarrierCodes": [
                  "AA",
                  "TP",
                  "AZ"
                ]
              }
            }
          }
        });
      * ```
      */
	post(params: FlightOffersSearchPostParams): FlightOffersSearchPostReturnedResponse;
}

/**
 * A namespaced client for the
 * `/v1/shopping/flight-offers/prediction` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.flightOffers.prediction;
 * ```
 *
 * @param {Client} client
 */
declare class FlightChoicePrediction {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of flight offers with the probability to be chosen.
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Returns flights from NYC to MAD with the probability to be chosen.
	 *
	 * ```ts
	 * amadeus.shopping.flightOffersSearch.get({
	 *     originLocationCode: 'SYD',
	 *     destinationLocationCode: 'BKK',
	 *     departureDate: '2020-08-01',
	 *     adults: '2'
	 * }).then(function(response){
	 *     return amadeus.shopping.flightOffers.prediction.post(
	 *       JSON.stringify(response)
	 *     );
	 * }).then(function(response){
	 *     console.log(response.data);
	 * }).catch(function(responseError){
	 *     console.log(responseError);
	 * });
	 * ```
	 */
	post(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

interface FlightOfferPricingIn {
	type: 'flight-offers-pricing';
	flightOffers: FlightOffer$1[];
	payments?: {
		brand?: PaymentBrand;
		binNumber?: number;
		flightOfferIds?: string[];
	}[];
	travelers?: Traveler[];
}
interface FlightOfferPricingOut {
	type: string;
	flightOffers: FlightOffer$1[];
	bookingRequirements?: {
		invoiceAddressRequired?: boolean;
		mailingAddressRequired?: boolean;
		emailAddressRequired?: boolean;
		phoneCountryCodeRequired?: boolean;
		mobilePhoneNumberRequired?: boolean;
		phoneNumberRequired?: boolean;
		postalCodeRequired?: boolean;
		travelerRequirements?: {
			travelerId?: string;
			genderRequired?: boolean;
			documentRequired?: boolean;
			documentIssuanceCityRequired?: boolean;
			dateOfBirthRequired?: boolean;
			redressRequiredIfAny?: boolean;
			airFranceDiscountRequired?: boolean;
			spanishResidentDiscountRequired?: boolean;
			residenceRequired?: boolean;
		}[];
	};
}
interface CreditCardFee {
	brand?: PaymentBrand;
	amount?: string;
	currency?: string;
	flightOfferId?: string;
}
type PaymentBrand =
	| 'VISA'
	| 'AMERICAN_EXPRESS'
	| 'MASTERCARD'
	| 'VISA_ELECTRON'
	| 'VISA_DEBIT'
	| 'MASTERCARD_DEBIT'
	| 'MAESTRO'
	| 'DINERS'
	| 'MASTERCARD_IXARIS'
	| 'VISA_IXARIS'
	| 'MASTERCARD_AIRPLUS'
	| 'UATP_AIRPLUS';
interface DetailedFareRules {
	fareBasis?: string;
	name?: string;
	fareNotes?: TermAndCondition;
	segmentId?: string;
}
type Bags = BaggageAllowance$1 & {
	name?: string;
	price?: ElementaryPrice;
	bookableByItinerary?: boolean;
	segmentIds?: string[];
	travelerIds?: string[];
};
interface OtherServices {
	name?: ServiceName;
	price?: ElementaryPrice;
	bookableByTraveler?: boolean;
	bookableByItinerary?: boolean;
	segmentIds?: string[];
	travelerIds?: string[];
}
type FlightOffersPricingParams = {
	data: FlightOfferPricingIn;
};
type FlightOffersPricingAdditionalParams = {
	include?: string | string[];
	forceClass?: boolean;
};
type FlightOffersPricingResult = {
	data: FlightOfferPricingOut;
	warnings?: Issue[];
	included?: {
		'credit-card-fees': {
			[key: string]: CreditCardFee;
		};
		bags: {
			[key: string]: Bags;
		};
		'other-services': {
			[key: string]: OtherServices;
		};
		'detailed-fare-rules': {
			[key: string]: DetailedFareRules;
		};
	};
	dictionaries?: Dictionaries$1;
};
type FlightOffersPricingReturnedResponse = ReturnedResponseSuccess<
	FlightOffersPricingResult,
	FlightOffersPricingResult['data']
>;

/**
 * A namespaced client for the
 * `/v1/shopping/flight-offers/pricing` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.flightOffers.pricing;
 * ```
 *
 * @param {Client} client
 */
declare class Pricing {
	private client;
	constructor(client: Client);
	/**
	 * To get or confirm the price of a flight and obtain information
	 * about taxes and fees to be applied to the entire journey. It also
	 * retrieves ancillary information (e.g. additional bag or extra legroom
	 * seats pricing) and the payment information details requested at booking time.
	 *
	 * @param {Object} params
	 * @param {Object} params.data
	 * @param {string} params.data.type 'flight-offers-pricing' for Flight Offer Pricing
	 * @param {Array} params.data.flightOffers list of flight offers for which the
	 * pricing needs to be retrieved
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * ```ts
	 * amadeus.shopping.flightOffers.pricing.post({
	 *  data: {
	 *      type: 'flight-offers-pricing',
	 *      flightOffers: []
	 *  }
	 * });
	 * ```
	 */
	post(
		params: FlightOffersPricingParams,
		additionalParams?: FlightOffersPricingAdditionalParams
	): Promise<FlightOffersPricingReturnedResponse>;
}

/**
 * A namespaced client for the
 * `/v1/shopping/flight-offers/upselling` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.flightOffers.upselling;
 * ```
 *
 * @param {Client} client
 */
declare class Upselling {
	private client;
	constructor(client: Client);
	/**
	 * Get available seats in different fare classes
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * ```ts
	 * amadeus.shopping.flightOffers.upselling.post(body);
	 * ```
	 */
	post(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/shopping/flight-offers` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.flightOffers;
 * ```
 *
 * @param {Client} client
 */
declare class FlightOffers {
	private client;
	prediction: FlightChoicePrediction;
	pricing: Pricing;
	upselling: Upselling;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v3/shopping/hotel-offers/:offer_id` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.hotelOfferSearch('XXX');
 * ```
 *
 * @param {Client} client
 * @property {number} offerId
 */
declare class HotelOfferSearch {
	private client;
	private offerId;
	constructor(client: Client, offerId: string);
	/**
	 * Returns details for a specific offer
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Find details for the offer with ID 'XXX'
	 *
	 * ```ts
	 *  amadeus.shopping.hotelOfferSearch('XXX').get();
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v3/shopping/hotel-offers` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.hotelOffersSearch;
 * ```
 *
 * @param {Client} client
 */
declare class HotelOffersSearch {
	private client;
	constructor(client: Client);
	/**
	 * Find the list of available offers in the specific hotels
	 *
	 * @param {Object} params
	 * @param {string} params.hotelIds Comma separated list of Amadeus hotel
	 * codes to request. Example: RTPAR001
	 * @param {string} params.adults Number of adult guests (1-9) per room.
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Search for available offers in Novotel Paris for 2 adults
	 *
	 * ```ts
	 * amadeus.shopping.hotelOffersSearch.get({
	 *   hotelIds: 'RTPAR001',
	 *   adults: '2'
	 * })
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

interface OperatingFlight {
	carrierCode?: string;
	number?: string;
	suffix?: string;
}
interface FlightOffer {
	type: string;
	id: string;
	source?: FlightOfferSource;
	instantTicketingRequired?: boolean;
	disablePricing?: boolean;
	nonHomogeneous?: boolean;
	oneWay?: boolean;
	paymentCardRequired?: boolean;
	lastTicketingDate?: string;
	numberOfBookableSeats?: number;
	itineraries?: {
		duration?: string;
		segments: Segment[];
	}[];
	price?: ExtendedPrice;
	pricingOptions?: {
		fareType?: PricingOptionsFareType;
		corporateCodes?: string[];
		includedCheckedBagsOnly?: boolean;
		refundableFare?: boolean;
		noRestrictionFare?: boolean;
		noPenaltyFare?: boolean;
	};
	validatingAirlineCodes?: string[];
	travelerPricings?: {
		travelerId: string;
		fareOption: TravelerPricingFareOption;
		travelerType: TravelerType;
		associatedAdultId?: string;
		price?: Price;
		fareDetailsBySegment: {
			segmentId: string;
			cabin?: TravelClass;
			fareBasis?: string;
			brandedFare?: string;
			class?: string;
			isAllotment?: boolean;
			allotmentDetails?: {
				tourName?: string;
				tourReference?: string;
			};
			sliceDiceIndicator?: SliceDiceIndicator;
			includedCheckedBags?: BaggageAllowance;
			additionalServices?: {
				chargeableCheckedBags?: BaggageAllowance;
				chargeableSeatNumber?: string;
				otherServices?: ServiceName[];
			};
		}[];
	}[];
	fareRules?: FareRules;
}
interface BaggageAllowance {
	excessRate?: ElementaryPrice;
	quantity?: number;
	weight?: number;
	weightUnit?: string;
}
interface Price {
	currency?: string;
	total?: string;
	base?: string;
	fees?: Fee[];
	taxes?: Tax[];
}
interface SeatMap {
	type?: string;
	id?: string;
	self?: Link;
	departure?: FlightEndPoint;
	arrival?: FlightEndPoint;
	carrierCode?: string;
	number?: string;
	operating?: OperatingFlight;
	aircraft?: AircraftEquipment;
	class?: string;
	flightOfferId?: string;
	segmentId?: string;
	decks?: Deck[];
	aircraftCabinAmenities?: AircraftCabinAmenities;
	availableSeatsCounters?: AvailableSeatsCounter[];
}
interface Deck {
	deckType?: 'UPPER' | 'MAIN' | 'LOWER';
	deckConfiguration?: DeckConfiguration;
	facilities?: Facility[];
	seats?: Seat[];
}
interface DeckConfiguration {
	width?: number;
	length?: number;
	startSeatRow?: number;
	endSeatRow?: number;
	startWingsX?: number;
	endWingsX?: number;
	startWingsRow?: number;
	endWingsRow?: number;
	exitRowsX?: number[];
}
interface Facility {
	code?: string;
	column?: string;
	row?: string;
	position?: 'FRONT' | 'REAR' | 'SEAT';
	coordinates?: Coordinates;
}
interface Seat {
	cabin?: string;
	number?: string;
	characteristicsCodes?: string[];
	travelerPricing?: SeatmapTravelerPricing[];
	coordinates?: Coordinates;
}
interface Coordinates {
	x?: number;
	y?: number;
}
interface AvailableSeatsCounter {
	travelerId?: string;
	value?: number;
}
interface SeatmapTravelerPricing {
	travelerId?: string;
	seatAvailabilityStatus?: 'AVAILABLE' | 'BLOCKED' | 'OCCUPIED';
	price?: Price;
}
interface AircraftCabinAmenities {
	power?: AircraftCabinAmenitiesPower;
	seat?: AmenitySeat;
	wifi?: AircraftCabinAmenitiesWifi;
	entertainment?: AircraftCabinAmenitiesEntertainment[];
	food?: AircraftCabinAmenitiesFood;
	beverage?: AircraftCabinAmenitiesBeverage;
}
type AircraftCabinAmenitiesBeverage = Amenity & {
	beverageType?: 'ALCOHOLIC' | 'NON_ALCOHOLIC' | 'ALCOHOLIC_AND_NON_ALCOHOLIC';
};
type AircraftCabinAmenitiesPower = Amenity & {
	powerType?: 'PLUG' | 'USB_PORT' | 'ADAPTOR' | 'PLUG_OR_USB_PORT';
	usbType?: 'USB_A' | 'USB_C' | 'USB_A_AND_USB_C';
};
type AircraftCabinAmenitiesFood = Amenity & {
	foodType?: 'MEAL' | 'FRESH_MEAL' | 'SNACK' | 'FRESH_SNACK';
};
type AircraftCabinAmenitiesEntertainment = Amenity & {
	entertainmentType?: 'LIVE_TV' | 'MOVIES' | 'AUDIO_VIDEO_ON_DEMAND' | 'TV_SHOWS' | 'IP_TV';
};
type AircraftCabinAmenitiesWifi = Amenity & {
	wifiCoverage?: 'FULL' | 'PARTIAL';
};
interface Amenity {
	isChargeable?: boolean;
}
interface AmenitySeat {
	legSpace?: number;
	spaceUnit?: 'INCHES' | 'CENTIMENTERS';
	tilt?: 'FULL_FLAT' | 'ANGLE_FLAT' | 'NORMAL';
	amenityType?: 'SEAT';
	medias?: AmenityMedia[];
}
interface AmenityMedia {
	title?: string;
	href?: string;
	description?: QualifiedFreeText;
	mediaType?:
		| 'application'
		| 'audio'
		| 'font'
		| 'example'
		| 'image'
		| 'message'
		| 'model'
		| 'multipart'
		| 'text'
		| 'video';
}
type FacilityDictionary = Record<string, string>;
type SeatCharacteristicDictionary = Record<string, string>;
interface Link {
	href: string;
	methods?: ('GET' | 'PUT' | 'DELETE' | 'POST' | 'PATCH')[];
	count?: number;
}
interface QualifiedFreeText {
	text?: string;
	lang?: string;
}
interface Dictionaries {
	locations?: LocationEntry;
	facility?: FacilityDictionary;
	seatCharacteristics?: SeatCharacteristicDictionary;
}
type SeatmapsGetParams = {
	'flight-orderId': string;
};
type SeatmapsGetResult = {
	meta?: CollectionMetaLink;
	warnings?: Issue[];
	data: SeatMap[];
	dictionaries: Dictionaries;
};
type SeatmapsGetReturnedResponse = ReturnedResponseSuccess<
	SeatmapsGetResult,
	SeatmapsGetResult['data']
>;
type SeatmapsPostParams = {
	data: FlightOffer[];
	included?: {
		travelers: {
			[key: string]: Traveler;
		};
	};
};
type SeatmapsPostResult = {
	meta?: CollectionMetaLink;
	warnings?: Issue[];
	data: SeatMap[];
	dictionaries: Dictionaries;
};
type SeatmapsPostReturnedResponse = ReturnedResponseSuccess<
	SeatmapsPostResult,
	SeatmapsPostResult['data']
>;

/**
 * A namespaced client for the
 * `/v1/shopping/seatmaps` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.seatmaps;
 * ```
 *
 * @param {Client} client
 */
declare class Seatmaps {
	private client;
	constructor(client: Client);
	/**
	 * To retrieve the seat map of each flight present in an order.
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Retrieve the seat map for flight order with ID 'XXX'
	 *
	 * ```ts
	 * amadeus.shopping.seatmaps.get({
	 *    'flight-orderId': 'XXX'}
	 * );
	 * ```
	 */
	get(params: SeatmapsGetParams): Promise<SeatmapsGetReturnedResponse>;
	/**
	 * To retrieve the seat map of each flight included in a flight offer.
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * To retrieve the seat map of each flight included in flight offers
	 * for MAD-NYC flight on 2020-08-01.
	 *
	 * ```ts
	 * amadeus.shopping.flightOffers.get({
	 *    originLocationCode: 'MAD',
	 *    destinationLocationCode: 'NYC',
	 *    departureDate: '2020-08-01',
	 *    adults: 1,
	 * }).then(function(response){
	 *    return amadeus.shopping.seatmaps.post(
	 *        {
	 *            'data': response.data
	 *        }
	 *    );
	 * });
	 * ```
	 */
	post(params: SeatmapsPostParams): Promise<SeatmapsPostReturnedResponse>;
}

/**
 * A namespaced client for the
 * `/v1/shopping/transfer-offers` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping.transferOffers;
 * ```
 *
 * @param {Client} client
 */
declare class TransferOffers {
	private client;
	constructor(client: Client);
	/**
     * To search the list of transfer offers.
     *
     * @param {Object} params
     * @return {Promise<Response|ResponseError>} a Promise
     *
     * To search the list of transfer offers
     *
     * ```ts
     * amadeus.shopping.transferOffers.post(body)
  
     * ```
    */
	post(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/shopping`, `/v2/shopping` and `/v3/shopping` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.shopping;
 * ```
 *
 * @param {Client} client
 * @property {FlightDestinations} flightDestinations
 * @property {FlightOffers} flightOffers
 * @property {FlightOffersSearch} flightOffersSearch
 * @property {FlightDates} flightDates
 * @property {Seatmaps} seatmaps
 * @property {HotelOfferSearch} hotelOffers
 * @property {HotelOffersSearch} hotelOffers
 * @property {Availability} availability
 * @property {TransferOffers} transferOffers
 */
declare class Shopping {
	private client;
	flightDestinations: FlightDestinations;
	flightOffers: FlightOffers;
	flightOffersSearch: FlightOffersSearch;
	flightDates: FlightDates;
	seatmaps: Seatmaps;
	hotelOffersSearch: HotelOffersSearch;
	activities: Activities;
	availability: Availability;
	transferOffers: TransferOffers;
	constructor(client: Client);
	/**
	 * Loads a namespaced path for a specific offer ID for Hotel Search V3
	 *
	 * @param {string} [offerId] The ID of the offer for a dedicated hotel
	 * @return {HotelOfferSearch}
	 **/
	hotelOfferSearch(offerId: string): HotelOfferSearch;
	/**
	 * Loads a namespaced path for a specific activity ID
	 *
	 * @param {string} [activityId] The ID of the activity for a dedicated tour or activity
	 * @return {Activity}
	 **/
	activity(activityId: string): Activity;
}

type FlightOrderGetResult = {
	meta: CollectionMetaLink;
	warnings?: Issue[];
	data: FlightOrder$1;
	dictionaries: Dictionaries$1;
};
type FlightOrderGetReturenedResponse = ReturnedResponseSuccess<
	FlightOrderGetResult,
	FlightOrderGetResult['data']
>;

/**
 * A namespaced client for the
 * `/v1/booking/flight-orders` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.booking.flightOrder;
 * ```
 *
 * @param {Client} client
 */
declare class FlightOrder {
	private client;
	private orderId;
	constructor(client: Client, orderId: string);
	/**
	 * To retrieve a flight order based on its id.
	 *
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * To retrieve a flight order with ID 'XXX'
	 *
	 * ```ts
	 * amadeus.booking.flightOrder('XXX').get();
	 * ```
	 */
	get(): Promise<FlightOrderGetReturenedResponse>;
	/**
	 * To cancel a flight order based on its id.
	 *
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * To cancel a flight order with ID 'XXX'
	 *
	 * ```ts
	 * amadeus.booking.flightOrder('XXX').delete();
	 * ```
	 */
	delete(): Promise<ReturnedResponseSuccess<null, null>>;
}

type FlightOrdersParams = {
	data: FlightOrder$1;
};
type FlightOrdersResult = {
	meta: CollectionMetaLink;
	warnings?: Issue[];
	data: FlightOrder$1;
	dictionaries: Dictionaries$1;
};
type FlightOrdersReturnType = ReturnedResponseSuccess<
	FlightOrdersResult,
	FlightOrdersResult['data']
>;

/**
 * A namespaced client for the
 * `/v1/booking/flight-orders` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.booking.flightOrders;
 * ```
 *
 * @param {Client} client
 */
declare class FlightOrders {
	private client;
	constructor(client: Client);
	/**
	 * To book the selected flight-offer and create a flight-order
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * To book the flight-offer(s) suggested by flightOffersSearch and create a flight-order
	 *
	 * ```ts
	 * amadeus.booking.flightOrders.post({
	 *  'type': 'flight-order',
	 *  'flightOffers': [],
	 *  'travelers': []
	 * });
	 * ```
	 */
	post(params: FlightOrdersParams): Promise<FlightOrdersReturnType>;
}

/**
 * A namespaced client for the
 * `/v1/booking/hotel-bookings` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.booking.hotelBookings;
 * ```
 *
 * @param {Client} client
 */
declare class HotelBookings {
	private client;
	constructor(client: Client);
	/**
	 * To book the offer retrieved from Hotel Shopping API.
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * To book the hotel offer with ID 'XXX' with guests & payments info
	 *
	 * ```ts
	 * amadeus.booking.hotelBookings.post(
	 * JSON.stringify({
	 * 'data': {
	 *   'offerId': 'XXXX',
	 *   'guests': [],
	 *   'payments': [],
	 *   'rooms': []
	 * }})
	 * )
	 * ```
	 */
	post(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v2/booking/hotel-orders` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.booking.hotelOrders;
 * ```
 *
 * @param {Client} client
 */
declare class HotelOrders {
	private client;
	constructor(client: Client);
	/**
	 * To book the offer retrieved from Hotel Search API.
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * To book the hotel offer with ID 'XXX' with guests, travel agents and payment info
	 *
	 * ```ts
	 * amadeus.booking.hotelOrders.post(
	 * JSON.stringfy({
	 * 'data': {
	 *     'type': 'hotel-order',
	 *     'guests': [],
	 *     'travelAgent': {},
	 *     'roomAssociations': [],
	 *     'payment': {}
	 * }})
	 *)
	 * ```
	 */
	post(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/booking` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.booking;
 * ```
 *
 * @param {Client} client
 * @property {FlightOrders} flightOrders
 * @property {FlightOrder} flightOrder
 * @property {HotelBookings} hotelBookings
 * @property {HotelOrders} hotelOrders
 * @protected
 */
declare class Booking {
	private client;
	flightOrders: FlightOrders;
	hotelBookings: HotelBookings;
	hotelOrders: HotelOrders;
	constructor(client: Client);
	flightOrder(orderId: string): FlightOrder;
}

/**
 * A namespaced client for the
 * `/v1/travel/analytics/air-traffic/traveled` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.travel.analytics.AirTraffic.Traveled;
 * ```
 *
 * @param {Client} client
 */
declare class Traveled {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of air traffic reports based on the number of people traveling.
	 *
	 * @param {Object} params
	 * @param {string} params.originCityCode IATA code of the origin city - e.g. MAD for
	 *   Madrid - required
	 * @param {string} params.period period when consumers are travelling in
	 *   YYYY-MM format
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Where were people flying to from Madrid in the January 2017?
	 *
	 * ```ts
	 * amadeus.travel.analytics.AirTraffic.Traveled.get({
	 *   originCityCode: 'MAD',
	 *   period: '2017-01'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/travel/analytics/air-traffic/booked` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.travel.analytics.AirTraffic.Booked;
 * ```
 *
 * @param {Client} client
 */
declare class Booked {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of air traffic reports based on the number of bookings.
	 *
	 * @param {Object} params
	 * @param {string} params.originCityCode IATA code of the origin city - e.g. MAD for
	 *   Madrid - required
	 * @param {string} params.period period when consumers are travelling in
	 *   YYYY-MM format
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Where were people flying to from Madrid in the August 2017?
	 *
	 * ```ts
	 * amadeus.travel.analytics.AirTraffic.Booked.get({
	 *   originCityCode: 'MAD',
	 *   period: '2017-08'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/travel/analytics/air-traffic/busiest-period` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.travel.analytics.AirTraffic.BusiestPeriod;
 * ```
 *
 * @param {Client} client
 */
declare class BusiestPeriod {
	private client;
	constructor(client: Client);
	/**
	 * Returns a list of air traffic reports.
	 *
	 * @param {Object} params
	 * @param {string} params.cityCode IATA code of the origin city - e.g. MAD for
	 *   Madrid - required
	 * @param {string} params.period period when consumers are travelling in
	 *   YYYY-MM format
	 * @param {string} params.direction to select between arrivals and departures (default: arrivals)
	 *   YYYY-MM format
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * What were the busiest months for Madrid in 2017?
	 *
	 * ```ts
	 * amadeus.travel.analytics.AirTraffic.BusiestPeriod.get({
	 *   cityCode: 'MAD',
	 *   period: '2017',
	 *   direction: Amadeus.direction.arriving
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/travel/analytics/air-traffic` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.travel.analytics.airTraffic;
 * ```
 *
 * @param {Client} client
 */
declare class AirTraffic {
	private client;
	traveled: Traveled;
	booked: Booked;
	busiestPeriod: BusiestPeriod;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v2/travel/analytics` endpoints
 *
 * Access via the {Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.travel.analytics;
 * ```
 *
 * @param {Client} client
 * @property {Urls} urls
 * @protected
 */
declare class Analytics$2 {
	private client;
	airTraffic: AirTraffic;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v1/travel/predictions/flight-delay` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.travel.predictions.flightDelay;
 * ```
 *
 * @param {Client} client
 */
declare class FlightDelay {
	private client;
	constructor(client: Client);
	/**
	 * This machine learning API is based on a prediction model that takes the input of
	 * the user -time, carrier, airport and aircraft information- and
	 * predict the segment where the flight is likely to lay.
	 *
	 * @param {Object} params
	 * @param {string} params.originLocationCode city/airport IATA code to which the traveler is departing, e.g. PAR for Paris
	 * @param {string} params.destinationLocationCode city/airport IATA code to which the traveler is departing, e.g. PAR for Paris
	 * @param {string} params.departureDate the date on which the traveler will depart from the origin to go to the destination. Dates are specified in the ISO 8601 YYYY-MM-DD format, e.g. 2019-12-25
	 * @param {string} params.departureTime local time relative to originLocationCode on which the traveler will depart from the origin. Time respects ISO 8601 standard. e.g. 13:22:00
	 * @param {string} params.arrivalDate the date on which the traveler will arrive to the destination from the origin. Dates are specified in the ISO 8601 YYYY-MM-DD format, e.g. 2019-12-25
	 * @param {string} params.arrivalTime local time relative to destinationLocationCode on which the traveler will arrive to destination. Time respects ISO 8601 standard. e.g. 13:22:00
	 * @param {string} params.aircraftCode IATA aircraft code (http://www.flugzeuginfo.net/table_accodes_iata_en.php)
	 * @param {string} params.carrierCode airline / carrier code
	 * @param {string} params.flightNumber flight number as assigned by the carrier
	 * @param {string} params.duration flight duration in ISO8601 PnYnMnDTnHnMnS format, e.g. PT2H10M
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Predict the segment where LH1009 (BRU-FRA) is likely to lay on 2020-01-14
	 *
	 * ```ts
	 * amadeus.travel.predictions.flightDelay.get({
	 *    originLocationCode: 'BRU',
	 *    destinationLocationCode: 'FRA',
	 *    departureDate: '2020-01-14',
	 *    departureTime: '11:05:00',
	 *    arrivalDate: '2020-01-14',
	 *    arrivalTime: '12:10:00',
	 *    aircraftCode: '32A',
	 *    carrierCode: 'LH',
	 *    flightNumber: '1009',
	 *    duration: 'PT1H05M'
	 * })
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/travel/predictions/trip-purpose` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.travel.predictions.tripPurpose;
 * ```
 *
 * @param {Client} client
 */
declare class TripPurpose {
	private client;
	constructor(client: Client);
	/**
	 * Forecast traveler purpose, Business or Leisure, together with the probability in the context of search & shopping.
	 *
	 * @param {Object} params
	 * @param {string} params.originLocationCode city/airport IATA code from which the traveler will depart, e.g. BOS for Boston
	 * @param {string} params.destinationLocationCode city/airport IATA code to which the traveler is going, e.g. PAR for Paris
	 * @param {string} params.departureDate the date on which the traveler will depart from the origin to go to the destination. Dates are specified in the ISO 8601 YYYY-MM-DD format, e.g. 2017-12-25
	 * @param {string} params.returnDate the date on which the traveler will depart from the destination to return to the origin. Dates are specified in the ISO 8601 YYYY-MM-DD format, e.g. 2018-02-28
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Forecast traveler purpose for a NYC-MAD round-trip between 2020-08-01 & 2020-08-12.
	 *
	 * ```ts
	 * amadeus.travel.predictions.tripPurpose.get({
	 *    originLocationCode: 'NYC',
	 *    destinationLocationCode: 'MAD',
	 *    departureDate: '2020-08-01',
	 *    returnDate: '2020-08-12'
	 * })
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/travel/predictions/trip-purpose` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.travel.predictions;
 * ```
 *
 * @param {Client} client
 * @property {TripPurpose} tripPurpose
 * @property {FlightDelay} flightDelay
 */
declare class Predictions$1 {
	private client;
	tripPurpose: TripPurpose;
	flightDelay: FlightDelay;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v3/travel/trip-parser` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.tripParser;
 * ```
 *
 * @param {Client} client
 */
declare class TripParser {
	private client;
	constructor(client: Client);
	/**
	 * parse information from flight, hotel, rail, and rental car confirmation emails
	 *
	 * @param {Object} params
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * "How can I show travelers their full itinerary in one place?"
	 *
	 * ```ts
	 * amadeus.tripParser.post(body);
	 * ```
	 */
	post(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
	/**
	 * Helper method to convert file contents in UTF-8 encoded string
	 * into Base64 encoded string
	 */
	fromFile(fileContentsInUTF8Format: string | Buffer): string;
}

/**
 * A namespaced client for the
 * `/v1/travel` & `/v2/travel` & `/v3/travel` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.travel;
 * ```
 *
 * @param {Client} client
 * @property {Analytics} analytics
 * @property {Predictions} predictions
 * @property {TripParser} tripParser
 * @protected
 */
declare class Travel {
	private client;
	analytics: Analytics$2;
	predictions: Predictions$1;
	tripParser: TripParser;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v2/e-reputation/hotel-sentiments` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.eReputation.hotelSentiments;
 * ```
 *
 * @param {Client} client
 */
declare class HotelSentiments {
	private client;
	constructor(client: Client);
	/**
	 * Get the sentiment analysis of hotel reviews
	 *
	 * @param {Object} params
	 * @param {string} params.hotelIds Comma separated list of Amadeus hotel
	 *   codes to request. Example: XKPARC12
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Get Sentiment Analysis of reviews about Holiday Inn Paris Notre Dame.
	 *
	 * ```ts
	 * amadeus.eReputation.hotelSentiments.get({
	 *   hotelIds: 'XKPARC12'
	 * })
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v2/e-reputation` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.eReputation;
 * ```
 *
 * @param {Client} client
 * @property {hotelSentiments} hotel_sentiments
 */
declare class EReputation {
	private client;
	hotelSentiments: HotelSentiments;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v2/media/files` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.media.files;
 * ```
 *
 * @param {Client} client
 */
declare class Files {
	private client;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v2/media` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.media;
 * ```
 *
 * @param {Client} client
 * @property {Files} files
 */
declare class Media {
	private client;
	files: Files;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v1/ordering/transfer-orders/XXX/transfers/cancellation` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.ordering.transferOrder('XXX').transfers.cancellation.post(JSON.stringify({}), '12345');;
 * ```
 *
 * @param {Client} client
 */
declare class Cancellation {
	private client;
	private orderId;
	constructor(client: Client, orderId: string);
	/**
	 * To cancel a transfer order based on its id
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * To cancel a transfer order with ID 'XXX' and confirmation number '12345'
	 *
	 * ```ts
	 * amadeus.ordering.transferOrder('XXX').transfers.cancellation.post(JSON.stringify({}), '12345');;
	 * ```
	 */
	post(body: any, confirmNbr: string): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/ordering/transfer-orders/XXXXX/transfers` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.ordering.transferOrders('XXX').transfers;
 * ```
 *
 * @param {Client} client
 */
declare class Transfers {
	private client;
	private orderId;
	cancellation: Cancellation;
	constructor(client: Client, orderId: string);
}

/**
 * A namespaced client for the
 * `/v1/ordering/transfer-orders/XXXXX` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.ordering.transferOrder('XXX');
 * ```
 *
 * @param {Client} client
 * @param {string} orderId
 */
declare class TransferOrder {
	private client;
	private orderId;
	transfers: Transfers;
	constructor(client: Client, orderId: string);
}

/**
 * A namespaced client for the
 * `/v1/ordering/transfer-orders` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * cosnt amadeus = new Amadeus();
 * amadeus.ordering.transferOrders;
 * ```
 *
 * @param {Client} client
 */
declare class TransferOrders {
	private client;
	constructor(client: Client);
	/**
	 * To book the selected transfer-offer and create a transfer-order
	 *
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * To book the transfer-offer(s) suggested by transferOffers and create a transfer-order
	 *
	 * ```ts
	 * amadeus.ordering.transferOrders.post(body, '2094123123');;
	 * ```
	 */
	post(body: any, offerId: string): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/ordering` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.ordering;
 * ```
 *
 * @param {Client} client
 * @property {TransferOrders} transferOrders
 * @property {TransferOrder} transferOrder
 */
declare class Ordering {
	private client;
	transferOrders: TransferOrders;
	transferOrder: (orderId: string) => TransferOrder;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v1/airport/direct-destinations` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.airport.directDestinations;
 * ```
 *
 * @param {Client} client
 */
declare class DirectDestinations {
	private client;
	constructor(client: Client);
	/**
	 * Get the percentage of on-time flight departures from a given airport
	 *
	 * @param {Object} params
	 * @param {string} params.departureAirportCode airport IATA code, e.g. BOS for Boston
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * What destinations are served by this airport?
	 *  ```ts
	 * amadeus.airport.directDestinations.get({
	 *   departureAirportCode: 'JFK',
	 * })
	 * ```
	 */
	get(params?: {}): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/airport/predictions/on-time` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.airport.predictions.onTime;
 * ```
 *
 * @param {Client} client
 */
declare class OnTime {
	private client;
	constructor(client: Client);
	/**
	 * Get the percentage of on-time flight departures from a given airport
	 *
	 * @param {Object} params
	 * @param {string} params.airportCode airport IATA code, e.g. BOS for Boston
	 * @param {string} params.date the date on which the traveler will depart
	 * from the give airport. Dates are specified in the ISO 8601 YYYY-MM-DD format, e.g. 2019-12-25
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Get the percentage of on-time flight departures from JFK
	 *
	 * ```ts
	 * amadeus.airport.predictions.onTime.get({
	 *   airportCode: 'JFK',
	 *   date: '2020-08-01'
	 * })
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/airport/predictions` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.airport;
 * ```
 *
 * @param {Client} client
 * @property {predictions} OnTime
 */
declare class Predictions {
	private client;
	onTime: OnTime;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v1/airport` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.airport;
 * ```
 *
 * @param {Client} client
 * @property {Predictions} predictions
 */
declare class Airport {
	private client;
	directDestinations: DirectDestinations;
	predictions: Predictions;
	constructor(client: Client);
}

type PageName = 'next' | 'previous' | 'first' | 'last';

/**
 * A helper library for handling pagination.
 *
 * @param {Client} client the client to make the API calls against
 * @protected
 */
declare class Pagination {
	private client;
	constructor(client: Client);
	/**
	 * Fetch the page for the given page name, and make the next API call based on
	 * the previous request made.
	 *
	 * @param {PageName} pageName the name of the page to fetch, should be available
	 *    as a link in the meta links in the response
	 * @param {Response} response the response containing the links to the next pages,
	 *   and the request used to make the previous call
	 * @return {Promise<Response|ResponseError>} a Promise
	 * @public
	 */
	page(pageName: PageName, response: ReturnedResponseSuccess<any, any>): Promise<any>;
	/**
	 * Makes a new call for the new page number
	 *
	 * @param  {Request} request the request used to make the previous call
	 * @param  {number} pageNumber the page number to fetch
	 * @return {Promise<Response|ResponseError>} a Promise
	 * @private
	 */
	private call;
	/**
	 * Tries to determine the page number from the page name. If not present, it
	 * just returns null
	 *
	 * @param  {ReturnedResponseSuccess} response the response containing the links to the next pages
	 * @param  {PageName} pageName the name of the page to fetch
	 * @return {string}
	 * @private
	 */
	private pageNumber;
	/**
	 * Returns a Promise that always resolves to null
	 *
	 * @return {Promise} a Promise that always resolves to null
	 * @private
	 */
	private nullPromise;
}

/**
 * A namespaced client for the
 * `/v2/schedule/flights` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.schedule.flights;
 * ```
 *
 * @param {Client} client
 */
declare class Flights {
	private client;
	constructor(client: Client);
	/**
	 * Provides real-time flight schedule data including up-to-date departure and arrival times,
	 *  terminal and gate information, flight duration and real-time delay status
	 *
	 * @param {Object} params
	 * @param {string} params.carrierCode 2 to 3-character IATA carrier code - required
	 * @param {string} params.flightNumber 1 to 4-digit number of the flight. e.g. 4537 - required
	 * @param {string} params.scheduledDepartureDate scheduled departure date of the flight, local to the departure airport - required
	 * @return {Promise<Response|ResponseError>} a Promise
	 * What's the current status of my flight?
	 * ```ts
	 * amadeus.schedule.flights.get({
	 * carrierCode: 'AZ',
	 * flightNumber: '319',
	 * scheduledDepartureDate: '2021-03-13'
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v2/schedule` endpoints
 *
 * Access via the {Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.schedule.flights;
 * ```
 *
 * @param {Client} client
 * @property {Flights} flights
 * @protected
 */
declare class Schedule {
	private client;
	flights: Flights;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v1/analytics/itinerary-price-metrics
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.analytics.itineraryPriceMetrics
 * ```
 *
 * @param {Client} client
 */
declare class ItineraryPriceMetrics {
	private client;
	constructor(client: Client);
	/**
	 * Provides historical prices in a quartile distribution, including minimum, maximum and average price.
	 *
	 * @param {Object} params
	 * @param {string} params.originIataCode city/airport code, following IATA standard, from which the traveler will depart
	 * @param {string} params.destinationIataCode city/airport code, following IATA standard, from which the traveler is going
	 * @param {string} params.departureDate The date on which the traveler will depart from the origin to go to the destination.
	 * @return {Promise<Response|ResponseError>} a Promise
	 * Am I getting a good deal on this flight?
	 * ```ts
	 * amadeus.analytics.itineraryPriceMetrics.get({
	 * originIataCode: 'MAD',
	 * destinationIataCode: 'CDG',
	 * departureDate: '2021-03-13'
	 * });
	 * ```
	 */
	get(params?: {}): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/analytics` endpoints
 *
 * Access via the {Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.analytics;
 * ```
 *
 * @param {Client} client
 * @property {Flights} flights
 */
declare class Analytics$1 {
	private client;
	itineraryPriceMetrics: ItineraryPriceMetrics;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v1/airline/destinations` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.airline.destinations;
 * ```
 *
 * @param {Client} client
 */
declare class Destinations {
	private client;
	constructor(client: Client);
	/**
	 * find all destinations served by a given airline
	 *
	 * @param {Object} params
	 * @param {string} params.airlineCode airline IATA code, e.g. BA for British airways
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 *  What destinations are served by this airline?
	 *  ```ts
	 * amadeus.airline.destinations.get({
	 *   airlineCode: 'BA',
	 * })
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/airline` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.airline;
 * ```
 *
 * @param {Client} client
 */
declare class Airline {
	private client;
	destinations: Destinations;
	constructor(client: Client);
}

export interface IAmadeus {
	referenceData: ReferenceData;
	shopping: Shopping;
	booking: Booking;
	travel: Travel;
	eReputation: EReputation;
	media: Media;
	ordering: Ordering;
	airport: Airport;
	pagination: Pagination;
	schedule: Schedule;
	analytics: Analytics$1;
	airline: Airline;
}
type LogLevel = 'debug' | 'warn' | 'silent';
type Hostname = 'production' | 'test';
type Network = typeof http | typeof https;
type Options = {
	clientId?: string;
	clientSecret?: string;
	logger?: Console;
	logLevel?: LogLevel;
	hostname?: Hostname;
	host?: string;
	ssl?: boolean;
	port?: number;
	customAppId?: string;
	customAppVersion?: string;
	http?: Network;
};
type LocationType = {
	airport: 'AIRPORT';
	city: 'CITY';
	any: 'AIRPORT,CITY';
};
type DirectionType = {
	arriving: 'ARRIVING';
	departing: 'DEPARTING';
};

type ErrorCodes =
	| 'NetworkError'
	| 'ParserError'
	| 'ServerError'
	| 'ClientError'
	| 'AuthenticationError'
	| 'NotFoundError'
	| 'UnknownError';

/**
 * The error that is passed to the Promise when the API call fails.
 *
 * @param {Response} response the {@link Response} object containing the raw
 *  http response and the {@link Request} instance that made the API call.
 * @property {Response} response the {@link Response} object containing the raw
 *  http response and the {@link Request} instance that made the API call.
 * @property {string} code a unique code for this type of error. Options include
 *  `NetworkError`, `ParserError`, `ResponseError`, `ServerError`,
 *  `AuthenticationError`, `NotFoundError` and `UnknownError`
 *  from the  {@link Response}'s parsed data
 */
declare class ResponseError {
	response: ReturnedResponseError;
	code: ErrorCodes;
	description: Issue[];
	constructor(response: Response);
	private determineDescription;
}

/**
 * A namespaced client for the
 * `/v1/location/analytics/category-rated-areas` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.location.analytics.categoryRatedAreas;
 * ```
 *
 * @param {Client} client
 */
declare class CategoryRatedAreas {
	private client;
	constructor(client: Client);
	/**
	 * Gets popularity score for location categories
	 *
	 * @param {Object} params
	 * @param {number} params.latitude latitude location to be at the center of
	 *   the search circle - required
	 * @param {number} params.longitude longitude location to be at the center of
	 *   the search circle - required
	 * @param {number} params.radius radius of the search in Kilometer - optional
	 * @return {Promise<Response|ResponseError>} a Promise
	 *
	 * Gets popularity score for location categories in Barcelona
	 *
	 * ```ts
	 * amadeus.location.analytics.categoryRatedAreas.get({
	 *   longitude: 2.160873,
	 *   latitude: 41.397158
	 * });
	 * ```
	 */
	get(params?: Object): Promise<ReturnedResponseSuccess<unknown, unknown>>;
}

/**
 * A namespaced client for the
 * `/v1/location/analytics` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.location;
 * ```
 *
 * @param {Client} client
 * @property {analytics} CategoryRatedAreas
 */
declare class Analytics {
	private client;
	categoryRatedAreas: CategoryRatedAreas;
	constructor(client: Client);
}

/**
 * A namespaced client for the
 * `/v1/location` endpoints
 *
 * Access via the {@link Amadeus} object
 *
 * ```ts
 * const amadeus = new Amadeus();
 * amadeus.location;
 * ```
 *
 * @param {Client} client
 * @property {analytics} analytics
 */
declare class Location {
	private client;
	analytics: Analytics;
	constructor(client: Client);
}

/**
 * The Amadeus client library for accessing the travel APIs.
 *
 * Initialize using your credentials:
 *
 * ```ts
 * const Amadeus = require('amadeus');
 * const amadeus = new Amadeus({
 *     clientId:    'YOUR_CLIENT_ID',
 *     clientSecret: 'YOUR_CLIENT_SECRET'
 * });
 * ```
 *
 * Alternatively, initialize the library using
 * the environment variables `AMADEUS_CLIENT_ID`
 * and `AMADEUS_CLIENT_SECRET`
 *
 * ```ts
 * const amadeus = new Amadeus();
 * ```
 *
 * @param {Options} options
 * @param {string} options.clientId the API key used to authenticate the API
 * @param {string} options.clientSecret the API secret used to authenticate
 *  the API
 * @param {Console} [options.logger=console] a `console`-compatible logger that
 *  accepts `log`, `error` and `debug` calls.
 * @param {LogLevel} [options.logLevel='warn'] the log level for the client,
 *  available options are `debug`, `warn`, and `silent`
 * @param {Hostname} [options.hostname='production'] the name of the server API
 *  calls are made to (`production` or `test`)
 * @param {string} [options.host] the full domain or IP for a server to make the
 *  API call to. Only use this if you don't want to use the provided servers
 * @param {boolean} [options.ssl=true] wether to use SSL for this API call
 * @param {number} [options.port=443] the port to make the API call to
 * @param {string} [options.customAppId=null] a custom App ID to be passed in
 * the User Agent to the server.
 * @param {string} [options.customAppVersion=null] a custom App Version number to
 * be passed in the User Agent to the server.
 * @param {Object} [options.http=https] an optional Node/HTTP(S)-compatible client
 *  that accepts a 'request()' call with an array of options.
 *
 * @property {Client} client The client for making authenticated HTTP calls
 * @property {string} version The version of this API client
 * @property {Location} location A handy list of location types, to be used in the locations API.
 * @example
 *
 * ```ts
 * amadeus.referenceData.location.get({
 *   keyword: 'lon',
 *   subType: Amadeus.location.any
 * });
 * ```
 *
 * @property {Direction} direction A handy list of direction types, to be used in the Flight Busiest Period API.
 * @example
 *
 * ```ts
 * amadeus.travel.analytics.airTraffic.busiestPeriod.get({
 *   cityCode: 'par',
 *   period: 2015,
 *   direction: Amadeus.direction.arriving
 * });
 * ```
 *
 */
declare class Amadeus implements IAmadeus {
	private client;
	private version;
	referenceData: ReferenceData;
	shopping: Shopping;
	booking: Booking;
	travel: Travel;
	eReputation: EReputation;
	media: Media;
	ordering: Ordering;
	airport: Airport;
	pagination: Pagination;
	schedule: Schedule;
	analytics: Analytics$1;
	location: Location;
	airline: Airline;
	static location: LocationType;
	static direction: DirectionType;
	constructor(options?: Options);
	/**
	 * The previous page for the given response. Resolves to null if the page
	 * could not be found.
	 *
	 * ```ts
	 * amadeus.referenceData.locations.get({
	 *   keyword: 'LON',
	 *   subType: 'AIRPORT,CITY',
	 *   page: { offset: 2 }
	 * }).then(function(response){
	 *   console.log(response);
	 *   return amadeus.previous(response);
	 * }).then(function(previousPage){
	 *   console.log(previousPage);
	 * });
	 * ```
	 *
	 * @param response the previous response for an API call
	 * @return {Promise<Response|ResponseError>} a Promise
	 */
	previous(response: ReturnedResponseSuccess<any, any>): Promise<unknown>;
	/**
	 * The next page for the given response. Resolves to null if the page could
	 * not be found.
	 *
	 * ```ts
	 * amadeus.referenceData.locations.get({
	 *   keyword: 'LON',
	 *   subType: 'AIRPORT,CITY'
	 * }).then(function(response){
	 *   console.log(response);
	 *   return amadeus.next(response);
	 * }).then(function(nextPage){
	 *   console.log(nextPage);
	 * });
	 * ```
	 *
	 * @param response the previous response for an API call
	 * @return {Promise<Response|ResponseError>} a Promise
	 */
	next(response: ReturnedResponseSuccess<any, any>): Promise<unknown>;
	/**
	 * The first page for the given response. Resolves to null if the page
	 * could not be found.
	 *
	 * ```ts
	 * amadeus.referenceData.locations.get({
	 *   keyword: 'LON',
	 *   subType: 'AIRPORT,CITY',
	 *   page: { offset: 2 }
	 * }).then(function(response){
	 *   console.log(response);
	 *   return amadeus.first(response);
	 * }).then(function(firstPage){
	 *   console.log(firstPage);
	 * });
	 * ```
	 *
	 * @param response the previous response for an API call
	 * @return {Promise<Response|ResponseError>} a Promise
	 */
	first(response: ReturnedResponseSuccess<any, any>): Promise<unknown>;
	/**
	 * The last page for the given response. Resolves to null if the page
	 * could not be found.
	 *
	 * ```ts
	 * amadeus.referenceData.locations.get({
	 *   keyword: 'LON',
	 *   subType: 'AIRPORT,CITY'
	 * }).then(function(response){
	 *   console.log(response);
	 *   return amadeus.last(response);
	 * }).then(function(lastPage){
	 *   console.log(lastPage);
	 * });
	 * ```
	 *
	 * @param response the previous response for an API call
	 * @return {Promise<Response|ResponseError>} a Promise
	 */
	last(response: ReturnedResponseSuccess<any, any>): Promise<unknown>;
}

export { ResponseError, Amadeus as default };

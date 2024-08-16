type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type ExcludeNull<T> = T extends null ? never : T;

type ResultType = ExcludeNull<
	UnwrapPromise<ReturnType<typeof import('./tool_calls').flight_search_tool_function>>
>;

const flightResponseParser = (response: ResultType) => {
	const str = '';
};

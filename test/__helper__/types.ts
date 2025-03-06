export type RouteResponse<Router, FnName extends keyof Router> = Router[FnName] extends (...args: any) => any
	? Awaited<ReturnType<Router[FnName]>>
	: never;

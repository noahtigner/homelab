export type RequestData<T> =
	| { status: 'loading'; data?: undefined; errorMessage?: undefined }
	| { status: 'error'; errorMessage: string; data?: undefined }
	| { status: 'ok'; data: T; errorMessage?: undefined };

export type ServiceStatus = 'ok' | 'warning' | 'error' | 'loading';

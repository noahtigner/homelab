import { type AxiosResponse, type AxiosRequestConfig } from 'axios';
import { type ZodType } from 'zod';
import { get } from 'lodash';
import { servicesClient } from './clients';

type GetRequest = <ResShape>(
	url: string,
	schema: ZodType<ResShape>,
	config?: AxiosRequestConfig<ResShape>,
	path?: string
) => Promise<AxiosResponse<ResShape>>;

type PostRequest = <ResShape, ReqShape = unknown>(
	url: string,
	data: ReqShape,
	responseSchema: ZodType<ResShape>,
	config?: AxiosRequestConfig<ReqShape>,
	path?: string
) => Promise<AxiosResponse<ResShape>>;

export const getRequest: GetRequest = (url, schema, config, path) => {
	const dataPath = path ? path : 'data';
	return servicesClient
		.get(url, config)
		.then((response) => {
			response.data = schema.parse(get(response, dataPath));
			return Promise.resolve(response);
		})
		.catch((error) => {
			console.error(error);
			return Promise.reject(error);
		});
};

export const postRequest: PostRequest = (
	url,
	data,
	responseSchema,
	config,
	path
) => {
	const dataPath = path ? path : 'data';
	return servicesClient
		.post(url, data, config)
		.then((response) => {
			response.data = responseSchema.parse(get(response, dataPath));
			return Promise.resolve(response);
		})
		.catch((error) => {
			console.error(error);
			return Promise.reject(error);
		});
};

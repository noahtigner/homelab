import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import {
	leetCodeSolvedDataSchema,
	leetCodeLanguagesSchema,
} from '../types/schemas';

export const useLeetCodeSolved = () => {
	return useQuery({
		queryKey: ['leetCodeSummary'],
		queryFn: () =>
			getRequest('/leetcode/solved/', leetCodeSolvedDataSchema).then(
				(res) => res.data
			),
	});
};

export const useLeetCodeLanguages = () => {
	return useQuery({
		queryKey: ['lcLanguageData'],
		queryFn: () =>
			getRequest('/leetcode/languages/', leetCodeLanguagesSchema).then(
				(res) => res.data.languages
			),
	});
};

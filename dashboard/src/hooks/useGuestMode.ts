import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/');

export function useGuestMode() {
	const isGuest = routeApi.useSearch({ select: (search) => search.guest });
	const navigate = routeApi.useNavigate();

	const toggleGuestMode = () =>
		navigate({
			search: (previous) => ({ ...previous, guest: !previous.guest }),
			hash: true,
			replace: true,
			resetScroll: false,
		});

	return { isGuest, toggleGuestMode };
}

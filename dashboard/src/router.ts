import {
	createRootRoute,
	createRoute,
	createRouter,
	type RouterHistory,
} from '@tanstack/react-router';
import { z } from 'zod';
import Index from '@/pages/Index';

const rootRoute = createRootRoute({
	validateSearch: z.looseObject({ guest: z.boolean().catch(false) }),
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: Index,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export function createAppRouter(history?: RouterHistory) {
	return createRouter({ routeTree, history });
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createAppRouter>;
	}
}

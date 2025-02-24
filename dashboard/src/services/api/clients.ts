import axios from 'axios';

export const servicesClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE,
});

export const primaryClient = axios.create({
	baseURL: `${import.meta.env.VITE_API_BASE}/diagnostics`,
});

export const piholeClient = axios.create({
	baseURL: `http://${import.meta.env.VITE_PIHOLE_IP}:81/api/diagnostics`,
});

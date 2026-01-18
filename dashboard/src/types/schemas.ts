import { z } from 'zod';

export const nasFolderSchema = z.object({
	name: z.string(),
	path: z.string(),
	is_dir: z.boolean(),
	num_dir: z.number(),
	num_file: z.number(),
	total_size: z.number(),
	time: z.object({
		last_accessed: z.number(),
		last_changed: z.number(),
		last_modified: z.number(),
		created: z.number(),
	}),
});

export const nasFoldersSchema = z.object({
	folders: z.array(nasFolderSchema),
});

export const nasDiagnosticsSchema = z.object({
	core: z.object({
		cpu_clock_speed: z.number(),
		cpu_cores: z.number(),
		cpu_family: z.string(),
		cpu_series: z.string(),
		cpu_vendor: z.string(),
		external_pci_slot_info: z.array(
			z.object({
				Occupied: z.string(),
				Recognized: z.string(),
				cardName: z.string(),
				slot: z.string(),
			})
		),
		firmware_date: z.string(),
		firmware_ver: z.string(),
		model: z.string(),
		ntp_server: z.string(),
		ram_size: z.number(),
		sys_temp: z.number(),
		temperature_warning: z.boolean(),
		up_time: z.string(),
	}),
	storage: z.object({
		hdd_info: z.array(
			z.object({
				capacity: z.number(),
				diskPath: z.string(),
				diskType: z.string(),
				diskno: z.string(),
				order: z.number(),
				overview_status: z.string(),
				status: z.string(),
				temp: z.number(),
				testing_type: z.string(),
			})
		),
		vol_info: z.array(
			z.object({
				desc: z.string(),
				is_encrypted: z.boolean(),
				name: z.string(),
				status: z.string(),
				total_size: z.number(),
				used_size: z.number(),
			})
		),
	}),
	network: z.object({
		dns: z.ipv4(),
		enabled_domain: z.boolean(),
		enabled_samba: z.boolean(),
		gateway: z.ipv4(),
		hostname: z.string(),
		nif: z.array(
			z.object({
				addr: z.ipv4(),
				id: z.string(),
				speed: z.number(),
				status: z.string(),
				type: z.string(),
				use_dhcp: z.boolean(),
			})
		),
		workgroup: z.string(),
	}),
	utilization: z.object({
		cpu: z.object({
			load_15_min_avg: z.number(),
			load_5_min_avg: z.number(),
			load_1_min_avg: z.number(),
		}),
		memory: z.object({
			real_usage: z.number(),
		}),
	}),
});

// SpeedTest schemas
export const serverSchema = z.object({
	url: z.string(),
	lat: z.string(),
	lon: z.string(),
	name: z.string(),
	country: z.string(),
	cc: z.string(),
	sponsor: z.string(),
	id: z.string(),
	host: z.string(),
	d: z.number(),
	latency: z.number(),
});

export const clientSchema = z.object({
	ip: z.string(),
	lat: z.string(),
	lon: z.string(),
	isp: z.string(),
	isprating: z.string(),
	rating: z.string(),
	ispdlavg: z.string(),
	ispulavg: z.string(),
	loggedin: z.string(),
	country: z.string(),
});

export const speedTestSchema = z.object({
	download: z.number(),
	upload: z.number(),
	ping: z.number(),
	server: serverSchema,
	timestamp: z.string(),
	bytes_sent: z.number(),
	bytes_received: z.number(),
	share: z.string().nullable(),
	client: clientSchema,
});

// Diagnostics schema
export const diagnosticsDataSchema = z.object({
	cpu: z.object({
		count: z.number(),
		percent: z.array(z.number()),
		temp: z.number().nullable(),
	}),
	memory: z.object({
		total: z.number(),
		used: z.number(),
		available: z.number(),
		percent: z.number(),
	}),
	disk: z.object({
		total: z.number(),
		used: z.number(),
		available: z.number(),
		percent: z.number(),
	}),
	pids: z.array(z.number()),
});

// Service status schema
export const serviceStatusSchema = z.object({
	status: z.enum(['ok', 'warning', 'error', 'loading']),
});

// LeetCode schemas
export const leetCodeProblemDifficultySchema = z.object({
	total: z.number(),
	solved: z.number(),
	solved_percent: z.number(),
	beats_percent: z.number(),
});

export const leetCodeProblemAllSchema = z.object({
	total: z.number(),
	solved: z.number(),
	solved_percent: z.number(),
	beats_percent: z.null(),
});

export const leetCodeSolvedDataSchema = z.object({
	all: leetCodeProblemAllSchema,
	easy: leetCodeProblemDifficultySchema,
	medium: leetCodeProblemDifficultySchema,
	hard: leetCodeProblemDifficultySchema,
});

export const leetCodeLanguageSchema = z.object({
	languageName: z.string(),
	problemsSolved: z.number(),
});

export const leetCodeLanguagesSchema = z.object({
	languages: z.array(leetCodeLanguageSchema),
});

// Investment/Money schemas
export const investmentSummaryDataSchema = z.object({
	totalValue: z.number(),
	oneDayChangeDollars: z.number(),
});

export const accountSchema = z.object({
	id: z.string(),
	syncDisabled: z.boolean(),
	isHidden: z.boolean(),
	isAsset: z.boolean(),
	includeInNetWorth: z.boolean(),
	type: z.object({
		name: z.string(),
		display: z.string(),
	}),
	displayName: z.string(),
	displayBalance: z.number(),
	signedBalance: z.number(),
	updatedAt: z.string(),
	icon: z.string(),
	logoUrl: z.string().nullable(),
	includeBalanceInNetWorth: z.boolean(),
	institution: z
		.object({
			id: z.string(),
			name: z.string(),
		})
		.optional(),
});

export const accountTypeSummarySchema = z.object({
	type: z.object({
		display: z.string(),
		group: z.enum(['asset', 'liability']),
		name: z.string(),
	}),
	accounts: z.array(accountSchema),
	totalDisplayBalance: z.number(),
});

export const netWorthSummaryDataSchema = z.object({
	data: z.object({
		accountTypeSummaries: z.array(accountTypeSummarySchema),
	}),
});

// OGP Preview schema
export const ogpPreviewSchema = z.object({
	hybridGraph: z.object({
		image: z.string(),
		title: z.string(),
		description: z.string(),
	}),
});

// Plex schemas
export const plexPlayerSchema = z.object({
	title: z.string(),
	platform: z.string(),
	product: z.string(),
	state: z.string(),
});

export const plexSessionSchema = z.object({
	username: z.string(),
	title: z.string(),
	media_type: z.string(),
	grandparent_title: z.string().nullable(),
	parent_title: z.string().nullable(),
	year: z.number().nullable(),
	thumb: z.string().nullable(),
	player: plexPlayerSchema,
	progress_percent: z.number(),
	duration_ms: z.number(),
	view_offset_ms: z.number(),
});

export const plexSessionsResponseSchema = z.object({
	count: z.number(),
	sessions: z.array(plexSessionSchema),
});

export const plexLibrarySectionSchema = z.object({
	key: z.string(),
	title: z.string(),
	type: z.string(),
	count: z.number(),
});

export const plexLibraryCountsResponseSchema = z.object({
	total_items: z.number(),
	sections: z.array(plexLibrarySectionSchema),
});

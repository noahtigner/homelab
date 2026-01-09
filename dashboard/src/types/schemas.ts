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

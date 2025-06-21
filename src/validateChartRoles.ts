type ChartRoleDef = {
	label: string;
	single?: boolean;
};

export function validateChartRoles(
	chartType: string,
	config: Record<string, unknown>
): { valid: boolean; missing: string[] } {
	
	const chartConfig = config[chartType] as { roles?: Record<string, ChartRoleDef> } | undefined;
	const requiredRoles = chartConfig?.roles || {};

	const missing: string[] = [];

	for (const [key, roleRaw] of Object.entries(requiredRoles)) {
		const role = roleRaw as ChartRoleDef;
		const value = config[key];

		if (role.single && !value) {
			missing.push(key);
		}
		if (!role.single && (!Array.isArray(value) || value.length === 0)) {
			missing.push(key);
		}
	}

	return {
		valid: missing.length === 0,
		missing,
	};
}

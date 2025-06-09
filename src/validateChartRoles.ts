type ChartRoleDef = {
	label: string;
	single?: boolean;
};

export function validateChartRoles(chartType: string, config: any): { valid: boolean; missing: string[] } {
	const roleDef = chartType && chartType in config ? config[chartType] : null;
	const requiredRoles = config[chartType]?.roles || {};

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

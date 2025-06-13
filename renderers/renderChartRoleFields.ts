import type ChartDashboardPlugin from "../main";
import { createRoleFieldRow } from "../src/settings-sections/createRoleFieldRow";
import { chartRoleDefinitions } from "../src/chartRoles";

export function renderChartRoleFields(
	container: HTMLElement,
	chartType: keyof typeof chartRoleDefinitions,
	config: any,
	availableFields: string[],
	plugin: ChartDashboardPlugin,
	forceRerender: () => void
) {
	// Clear container once
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	

	for (const field of availableFields) {
		const row = createRoleFieldRow(field, chartType, config, plugin, forceRerender);
		container.appendChild(row);
	}
}

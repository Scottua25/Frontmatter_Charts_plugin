import type ChartDashboardPlugin from "../main";
import { createRoleFieldRow } from "../src/settings-sections/createRoleFieldRow";
import { chartRoleDefinitions } from "../src/chartRoles";
import { getSortedFields } from "../src/helpers/sortFields";
import { enableDragAndDrop } from "../src/helpers/dragDrop";
import type { ChartConfig } from "../src/types";

export function renderChartRoleFields(
	container: HTMLElement,
	chartType: keyof typeof chartRoleDefinitions,
	config: ChartConfig,
	availableFields: string[],
	plugin: ChartDashboardPlugin,
	forceRerender: () => void
) {
	// Clear container once
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Use sorted field order
	const sortedFields = getSortedFields(availableFields, {
		sortOrder: config.sortOrder === "usage" ? "alphabetical" : config.sortOrder,
		customOrder: config.customOrder ?? [],
	});	
	if (!Array.isArray(sortedFields)) {
		console.error("[ROLE FIELDS] sortedFields is not an array", sortedFields);
		return;
	}

	for (const field of sortedFields) {
		const row = createRoleFieldRow(field, chartType, config, plugin, forceRerender);
		container.appendChild(row);
	}

	// Enable drag-and-drop only in custom sort mode
	if (config.sortOrder === "custom") {
		enableDragAndDrop(
			container,
			{
				sortOrder: config.sortOrder,
				customOrder: [], // default empty array
			},
			chartType,
			async () => {
				await plugin.saveSettings();
			}
		);
	}
}

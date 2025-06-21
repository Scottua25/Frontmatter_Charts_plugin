import { Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";
import { chartRendererMap } from "../chartRendererMap";
import type { ChartConfig, DropdownWithCustomUpdate, ChartType } from "src/types";

export function renderChartTypeSetting(
	block: HTMLElement,
	config: ChartConfig,
	plugin: ChartDashboardPlugin,
	updateRoleFields: () => void
): void {
	new Setting(block)
		.setName("Chart Type")
		.setDesc("Select chart visualization")
		.addDropdown((drop) => {
			const chartTypes = Object.keys(chartRendererMap);
			chartTypes.forEach((type) =>
				drop.addOption(type, type.charAt(0).toUpperCase() + type.slice(1))
			);
			drop.setValue(config.chartType || "heatmap").onChange(async (val) => {
				config.chartType = val as ChartType;
				await plugin.saveSettings();
				(updateRoleFields)?.();
				((config as { _chartStyleDropdown?: DropdownWithCustomUpdate })._chartStyleDropdown)?._updateStyleOptions?.();
			});
		});
}

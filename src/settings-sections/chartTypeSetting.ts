import { Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";
import { chartRendererMap } from "../chartRendererMap";

export function renderChartTypeSetting(
	block: HTMLElement,
	config: any,
	plugin: ChartDashboardPlugin,
	updateRoleFields: () => void
): void {
	new Setting(block)
		.setName("Chart Type")
		.setDesc("Select chart visualization")
		.addDropdown(drop => {
			const chartTypes = Object.keys(chartRendererMap);
			chartTypes.forEach(type =>
				drop.addOption(type, type.charAt(0).toUpperCase() + type.slice(1))
			);
			drop.setValue(config.chartType || "heatmap")
				.onChange(async (val) => {
					config.chartType = val;
					await plugin.saveSettings();
					(updateRoleFields as any)?.(); // Optional chaining
					(config._chartStyleDropdown as any)?._updateStyleOptions?.();
				});
		});
}

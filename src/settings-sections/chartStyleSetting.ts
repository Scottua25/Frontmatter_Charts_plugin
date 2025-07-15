import { Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";
import { CHART_STYLES } from "../settings";
import type { ChartStyleConfig, DropdownWithCustomUpdate } from "../types";

export function renderChartStyleSetting(
	block: HTMLElement,
	config: ChartStyleConfig,
	plugin: ChartDashboardPlugin,
	updateRoleFields: () => void
): void {
	
	new Setting(block)
		.setName("Chart style")
		.setDesc("Substyle of the selected chart type")
		.addDropdown((drop) => {

			const updateStyleOptions = () => {
				while (drop.selectEl.firstChild) {
					drop.selectEl.removeChild(drop.selectEl.firstChild);
				}
				const styles = CHART_STYLES[config.chartType] || [];
				styles.forEach((style) => {
					drop.addOption(style, style.charAt(0).toUpperCase() + style.slice(1));
				});

				const current = config.chartStyle || styles[0] || "";
				drop.setValue(current);
				config.chartStyle = current;
			};

			updateStyleOptions();

			drop.onChange(async (val) => {
				config.chartStyle = val;
				await plugin.saveSettings();
				updateRoleFields();
			});

			(drop as DropdownWithCustomUpdate)._updateStyleOptions = updateStyleOptions;
			config._chartStyleDropdown = drop as DropdownWithCustomUpdate;
		});
}

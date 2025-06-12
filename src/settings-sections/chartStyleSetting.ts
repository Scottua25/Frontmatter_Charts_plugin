import { Setting, DropdownComponent } from "obsidian";
import type ChartDashboardPlugin from "../../main";
import { CHART_STYLES } from "../settings";

export function renderChartStyleSetting(
	block: HTMLElement,
	config: any,
	plugin: ChartDashboardPlugin,
	updateRoleFields: () => void
): void {
	let chartStyleDropdown: DropdownComponent;

	new Setting(block)
		.setName("Chart Style")
		.setDesc("Substyle of the selected chart type")
		.addDropdown(drop => {
			chartStyleDropdown = drop;

			const updateStyleOptions = () => {
				while (drop.selectEl.firstChild) {
					drop.selectEl.removeChild(drop.selectEl.firstChild);
				}
				const styles = CHART_STYLES[config.chartType] || [];
				styles.forEach(style => {
					drop.addOption(style, style.charAt(0).toUpperCase() + style.slice(1));
				});

				const current = config.chartStyle || styles[0] || "";
				drop.setValue(current);
				config.chartStyle = current;
			};

			updateStyleOptions();

			drop.onChange(async val => {
				config.chartStyle = val;
				await plugin.saveSettings();
				updateRoleFields();
			});

			(drop as any)._updateStyleOptions = updateStyleOptions;
			config._chartStyleDropdown = drop;
		});
}

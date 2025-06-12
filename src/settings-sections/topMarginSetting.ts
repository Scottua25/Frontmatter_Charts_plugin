import { Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";

export function renderTopMarginSetting(
	block: HTMLElement,
	config: any,
	plugin: ChartDashboardPlugin
): void {
	new Setting(block)
		.setName("Top Margin")
		.setDesc("Top space for chart title (px)")
		.addText(text => {
			text
				.setPlaceholder("30")
				.setValue((config.marginTop ?? 30).toString())
				.onChange(async (val) => {
					const num = parseInt(val);
					if (!isNaN(num)) {
						config.marginTop = num;
						await plugin.saveSettings();
					}
				});
		});
}

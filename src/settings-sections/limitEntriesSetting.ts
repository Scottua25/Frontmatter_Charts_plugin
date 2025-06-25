import { Setting } from "obsidian";
import type { ChartConfig } from "../types";
import type ChartDashboardPlugin from "../../main";

export function renderLimitEntriesSetting(
	block: HTMLElement,
	config: ChartConfig,
	plugin: ChartDashboardPlugin
): void {

	new Setting(block)
		.setName("Limit Entries")
		.setDesc("Show only the most recent N entries on the chart (optional). Set to 0 to include all.")
		.addText((text) => {
			text
				.setPlaceholder("e.g., 30")
				.setValue(config.limitDays?.toString() ?? "")
				.onChange(async (val) => {
					const num = parseInt(val);
					config.limitDays = isNaN(num) ? 0 : num;
					await plugin.saveSettings();
				});
		});
}

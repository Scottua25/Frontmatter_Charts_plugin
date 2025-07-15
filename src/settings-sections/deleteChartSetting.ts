import { Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";

export function renderDeleteChartSetting(
	block: HTMLElement,
	key: string,
	plugin: ChartDashboardPlugin, // ✅ FIXED TYPE
	refresh: () => void
): void {
	new Setting(block)
		.setName("Delete chart")
		.setDesc("Delete this chart. CANNOT BE UNDONE! BE SURE!")
		.addButton((btn) =>
			btn
				.setButtonText("Delete")
				.setWarning()
				.onClick(async () => {
					delete plugin.settings.chartTypes[key];
					await plugin.saveSettings();
					refresh();
				})
		);
}

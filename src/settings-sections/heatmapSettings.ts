import { Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";

export function renderHeatmapSettings(
	block: HTMLElement,
	config: any,
	plugin: ChartDashboardPlugin
): void {
	if (config.chartType !== "heatmap") return;

	new Setting(block)
		.setName("Heatmap Cell Height")
		.setDesc("Pixel height per row in the heatmap")
		.addText((text) => {
			text
				.setPlaceholder("30")
				.setValue((config.cellHeight ?? 30).toString())
				.onChange(async (val) => {
					const parsed = parseInt(val);
					if (!isNaN(parsed)) {
						config.cellHeight = parsed;
						await plugin.saveSettings();
					}
				});
		});
}

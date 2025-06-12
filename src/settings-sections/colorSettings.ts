import type ChartDashboardPlugin from "../../main";
import { addColorWithAlphaSetting, addInlineColorPicker } from "../colorUtils";
import { Setting } from "obsidian";

export function renderColorSettings(
	block: HTMLElement,
	config: any,
	plugin: ChartDashboardPlugin
): void {
	const isHeatmap = config.chartType === "heatmap";
	const isBarOrLine = config.chartType === "bar" || config.chartType === "line";

	addColorWithAlphaSetting(
		block,
		isHeatmap ? "Background Color" : "Page Background",
		isHeatmap
			? "Background color behind the entire heatmap."
			: "Color surrounding the entire chart (canvas area).",
		config.backgroundPageColor || "rgba(0,0,0,0)",
		async (val) => {
			config.backgroundPageColor = val;
			await plugin.saveSettings();
		}
	);

	if (!isHeatmap) {
		addColorWithAlphaSetting(
			block,
			"Chart Area Background",
			"Color behind bars/lines inside the chart box.",
			config.backgroundPageColor || "rgba(0,0,0,0)",
			async (val) => {
				config.backgroundPageColor = val;
				await plugin.saveSettings();
			}
		);
	}

	if (isHeatmap) {
		const colorOptions = [
			"YlGnBu", "Viridis", "Hot", "Blues", "Greens", "Reds",
			"Jet", "Picnic", "Portland", "Electric", "Cividis"
		];

		new Setting(block)
			.setName("Colorscale")
			.setDesc("Plotly color scheme")
			.addDropdown(drop => {
				colorOptions.forEach(c => drop.addOption(c, c));
				drop.setValue(config.colorscale || "YlGnBu")
					.onChange(async val => {
						config.colorscale = val;
						await plugin.saveSettings();
					});
			});

		new Setting(block)
			.setName("Reverse Colorscale")
			.setDesc("Invert the heatmap color direction")
			.addToggle(toggle => {
				toggle
					.setValue(config.reverseScale ?? false)
					.onChange(async (val) => {
						config.reverseScale = val;
						await plugin.saveSettings();
					});
			});
	}

	if (isBarOrLine) {
		const chartColorSetting = new Setting(block)
			.setName("Chart Color")
			.setDesc("Primary color for bar or line charts")
			.addText(text => {
				text
					.setPlaceholder("#ff9900")
					.setValue(config.chartColor || "#ff9900")
					.onChange(async (val) => {
						config.chartColor = val;
						await plugin.saveSettings();
					});
			});

		addInlineColorPicker(
			chartColorSetting.controlEl,
			config.chartColor || "#ff9900",
			async (val) => {
				config.chartColor = val;
				const input = chartColorSetting.controlEl.querySelector("input[type='text']") as HTMLInputElement;
				if (input) input.value = val;
				await plugin.saveSettings();
			}
		);
	}
}

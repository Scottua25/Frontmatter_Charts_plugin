import { Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";
import { addInlineColorPicker } from "../colorUtils";

export function renderFontSettings(
	block: HTMLElement,
	config: any,
	plugin: ChartDashboardPlugin
): void {
	const fontColorSetting = new Setting(block)
		.setName("Font Color")
		.setDesc("Text color for values inside the chart")
		.addText(text => {
			text
				.setPlaceholder("#ffffff")
				.setValue(config.fontColor || "#ffffff")
				.onChange(async (value) => {
					config.fontColor = value;
					await plugin.saveSettings();
				});
		});

	addInlineColorPicker(
		fontColorSetting.controlEl,
		config.fontColor || "#ffffff",
		async (val) => {
			config.fontColor = val;
			const input = fontColorSetting.controlEl.querySelector("input[type='text']") as HTMLInputElement;
			if (input) input.value = val;
			await plugin.saveSettings();
		}
	);

	new Setting(block)
		.setName("Font Size")
		.setDesc("Font size for labels")
		.addText(text => {
			text
				.setPlaceholder("12")
				.setValue((config.fontSize ?? 12).toString())
				.onChange(async (val) => {
					const num = parseInt(val);
					if (!isNaN(num)) {
						config.fontSize = num;
						await plugin.saveSettings();
					}
				});
		});
}

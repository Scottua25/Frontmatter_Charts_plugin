import { Setting } from "obsidian";

export function renderSortOrderSetting(
	container: HTMLElement,
	config: any,
	saveSettings: () => Promise<void>,
	refreshUI: () => void
) {
	new Setting(container)
		.setName("Property Sort Order")
		.setDesc("Order of scanned YAML properties in the UI and charts.")
		.addDropdown(drop => {
			drop.addOption("alphabetical", "Alphabetical (A–Z)");
			drop.addOption("reverse", "Alphabetical (Z–A)");
			drop.addOption("custom", "Custom (drag to reorder)");

			drop.setValue(config.sortOrder || "alphabetical");

			drop.onChange(async (value) => {
				config.sortOrder = value;
				await saveSettings();
				refreshUI(); // re-renders role fields
			});
		});
}

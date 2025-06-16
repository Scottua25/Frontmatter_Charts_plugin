import { Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";

export function renderMarginSetting(
	container: HTMLElement,
	config: any,
	plugin: any
): void {

	const marginDefaults = {
		marginTop: 30,
		marginBottom: 40,
		marginLeft: 80,
		marginRight: 30,
	};

	const setting = new Setting(container)
		.setName("Margins")
		.setDesc("Set the chart margins in pixels");


	const row = document.createElement("div");
	row.classList.add("chart-margin-row");

	const fields: { key: keyof typeof marginDefaults; label: string }[] = [
		{ key: "marginTop", label: "Top" },
		{ key: "marginBottom", label: "Bottom" },
		{ key: "marginLeft", label: "Left" },
		{ key: "marginRight", label: "Right" },
	];

	for (const { key, label } of fields) {
		const input = document.createElement("input");
		input.type = "number";
		input.placeholder = marginDefaults[key].toString();
		input.value = (config[key] ?? marginDefaults[key]).toString();
		input.classList.add("chart-margin-input");

		input.addEventListener("change", async () => {
			const val = Number(input.value);
			config[key] = isNaN(val) ? marginDefaults[key] : val;
			await plugin.saveSettings();
		});

		const wrapper = document.createElement("label");
		wrapper.classList.add("chart-margin-label");
		wrapper.append(label + " ");
		wrapper.appendChild(input);

		setting.controlEl.appendChild(wrapper);
	}
}
import type ChartDashboardPlugin from "../../main";
import { addColorWithAlphaSetting, addInlineColorPicker, getColorscaleGradient } from "../colorUtils";
import { Setting, ToggleComponent } from "obsidian";
import Plotly from "plotly.js-dist-min";
import { customColorscales } from "../helpers/customColorScales";

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

	if (isHeatmap) {
		addColorWithAlphaSetting(
			block,
			"Chart Area Background",
			"Color behind bars/lines inside the chart box.",
			config.backgroundChartColor || "rgba(0,0,0,0)",
			async (val) => {
				config.backgroundChartColor = val;
				await plugin.saveSettings();
			}
		);
	}

	if (isHeatmap) {
		const colorOptions = [
			"YlGnBu", "Viridis", "Hot", "Blues", "Greens", "Reds",
			"Jet", "Picnic", "Portland", "Electric", "Cividis"
		];
	
		// Create a setting block
		const colorScaleSetting = new Setting(block)
		.setName("Colorscale")
		.setDesc("Plotly color scheme");

		// Create shared container for dropdown + toggle + preview
		const controlGroup = document.createElement("div");
		controlGroup.classList.add("colorscale-control-group");

		// Dropdown
		const dropdown = document.createElement("select");
		dropdown.classList.add("colorscale-dropdown");
		colorOptions.forEach(c => {
		const opt = document.createElement("option");
		opt.value = opt.text = c;
		dropdown.appendChild(opt);
		});
		dropdown.value = config.colorscale || "YlGnBu";
		controlGroup.appendChild(dropdown);

		// Toggle container
		const toggleContainer = document.createElement("div");
		toggleContainer.classList.add("colorscale-toggle-container");

		const toggleLabel = document.createElement("label");
		toggleLabel.textContent = "Reverse";
		toggleLabel.classList.add("colorscale-toggle-label");

		const reverseToggle = new ToggleComponent(toggleContainer);
		reverseToggle
		.setValue(config.reverseScale ?? false)
		.onChange(async val => {
			config.reverseScale = val;
			updatePreview(dropdown.value, val);
			await plugin.saveSettings();
		});

		toggleContainer.prepend(toggleLabel);
		controlGroup.appendChild(toggleContainer);

		// Gradient preview
		const previewEl = document.createElement("div");
		previewEl.classList.add("colorscale-preview-bar");
		controlGroup.appendChild(previewEl);

		// Append entire custom group into setting control
		colorScaleSetting.settingEl.querySelector(".setting-item-control")?.appendChild(controlGroup);

		// Initial update + dropdown handler
		const updatePreview = (val: string, reverse: boolean = false) => {
		const scale = customColorscales[val];
		if (Array.isArray(scale)) {
			const finalScale = reverse ? [...scale].reverse() : scale;
			previewEl.style.backgroundImage = getColorscaleGradient(finalScale);
		} else {
			previewEl.style.backgroundImage = "none";
		}
		};

		updatePreview(dropdown.value, config.reverseScale ?? false);

		dropdown.addEventListener("change", async () => {
		config.colorscale = dropdown.value;
		updatePreview(dropdown.value, config.reverseScale ?? false);
		await plugin.saveSettings();
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

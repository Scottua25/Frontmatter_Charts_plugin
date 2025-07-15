import { App, Modal, Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";
import type { ChartConfig } from "../types";

// --- Embedded Modal ---
class GradientModal extends Modal {
	private colors: string[];
	private onSubmit: (colors: string[]) => void;

	constructor(app: App, initialColors: string[], onSubmit: (colors: string[]) => void) {
		super(app);
		this.colors = Array.isArray(initialColors) && initialColors.length > 0
			? [...initialColors]
			: ["#000000", "#ffffff"];
		this.onSubmit = onSubmit;
	}

	onOpen() {
		while (this.contentEl.firstChild) {
			this.contentEl.removeChild(this.contentEl.firstChild);
		}
		this.render();
	}

	private render() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Define Custom Gradient" });

		const colorList = contentEl.createDiv();

		this.colors.forEach((color, index) => {
			const setting = new Setting(colorList)
				.setName(`Color ${index + 1}`)
				.addColorPicker(picker => {
					picker.setValue(color).onChange(val => {
						this.colors[index] = val;
					});
				});

			if (this.colors.length > 2) {
				setting.addButton(btn => {
					btn.setIcon("trash").setTooltip("Remove").onClick(() => {
						this.colors.splice(index, 1);
						this.render();
					});
				});
			}
		});

		new Setting(contentEl)
			.addButton(btn => btn.setButtonText("Add Color").onClick(() => {
				this.colors.push("#ffffff");
				this.render();
			}));

		new Setting(contentEl)
			.addButton(btn => btn.setButtonText("Save").setCta().onClick(() => {
				this.onSubmit(this.colors);
				this.close();
			}))
			.addButton(btn => btn.setButtonText("Cancel").onClick(() => this.close()));
	}

	onClose() {
		while (this.contentEl.firstChild) {
			this.contentEl.removeChild(this.contentEl.firstChild);
		}
	}
}

// --- Main Setting UI ---
export function renderCustomColorscaleSetting(
	block: HTMLElement,
	config: ChartConfig,
	plugin: ChartDashboardPlugin
) {
	const isHeatmap = config.chartType === "heatmap";

	const setting = new Setting(block)
		.setName("Custom Heatmap Colorscale")
		.setDesc("Define a custom gradient for this heatmap chart.");

	// === Create the Edit button
	setting.addButton(btn =>
		btn.setButtonText("Edit").onClick(() => {
			new GradientModal(
				plugin.app,
				Array.isArray(config.heatmapCustomGradient) ? config.heatmapCustomGradient : [],
				(colors) => {
					config.heatmapCustomGradient = colors;
					plugin.saveSettings();
					updatePreview(colors);
				}
			).open();
		})
	);

	// === Create the gradient preview bar
	const previewBar = document.createElement("div");
	previewBar.style.height = "16px";
	previewBar.style.marginTop = "4px";
	previewBar.style.borderRadius = "4px";
	previewBar.style.border = "1px solid var(--background-modifier-border)";
	previewBar.style.background = "#ccc"; // fallback
	setting.settingEl.appendChild(previewBar);

	// === Function to update the preview bar
	function updatePreview(colors: string[]) {
		if (!colors || colors.length < 2) {
			previewBar.style.background = "#ccc";
			return;
		}
		const gradient = `linear-gradient(to right, ${colors.join(", ")})`;
		previewBar.style.background = gradient;
	}

	// Initial render
	updatePreview(
		Array.isArray(config.heatmapCustomGradient) ? config.heatmapCustomGradient : []
	);
	

	// Hide if not a heatmap
	setting.settingEl.style.display = isHeatmap ? "" : "none";
}


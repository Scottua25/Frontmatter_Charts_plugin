import { App, Modal, Setting } from "obsidian";
import type ChartDashboardPlugin from "../../main";
import type { ChartConfig } from "../types";

class GradientModal extends Modal {
	private stops: { position: number; color: string }[];
	private selectedIndex: number = 0;
	private gradientBar!: HTMLDivElement;
	private stopContainer!: HTMLDivElement;
	private draggingIndex: number | null = null;

	constructor(
		app: App,
		initialColors: [number, string][],
		private onSubmit: (colors: [number, string][]) => void,
		private onUpdate?: (colors: [number, string][]) => void
	) {
		super(app);
		this.stops = initialColors.length
			? initialColors.map(([pos, color]) => ({ position: pos, color }))
			: [
				{ position: 0, color: "#000000" },
				{ position: 1, color: "#ffffff" },
			];
	}

	onOpen() {
		this.contentEl.empty();
	
		const wrapper = this.contentEl.createDiv({ cls: "gradient-bar-wrapper" });
	
		// Background gradient display
		this.gradientBar = wrapper.createDiv({ cls: "gradient-bar" });
	
		// Container for draggable/interactive stops
		this.stopContainer = wrapper.createDiv({ cls: "gradient-stop-container" });
	
		// Add stop on click
		this.gradientBar.addEventListener("click", (e) => {
			const rect = this.gradientBar.getBoundingClientRect();
			const clickX = e.clientX - rect.left;
			const newPos = clickX / rect.width;
	
			this.stops.push({ position: newPos, color: "#ffffff" });
			this.stops.sort((a, b) => a.position - b.position);
			this.selectedIndex = this.stops.findIndex(s => s.position === newPos);
	
			this.renderStops();
			this.highlightSelectedStop();
			this.updateGradientBackground();
			this.emitUpdate?.();
		});
	
		// Initial render
		this.renderStops();
		this.updateGradientBackground();
	
		// Action buttons
		new Setting(this.contentEl)
			.addButton(btn => btn
				.setButtonText("Save")
				.setCta()
				.onClick(() => {
					this.onSubmit(this.stops.map(s => [s.position, s.color]));
					this.close();
				})
			)
			.addButton(btn => btn
				.setButtonText("Cancel")
				.onClick(() => this.close())
			);
	}
	
	private highlightSelectedStop() {
		Array.from(this.stopContainer.children).forEach((el, i) => {
			el.classList.toggle("selected", i === this.selectedIndex);
		});
	}
	
	private renderStops() {
		this.stopContainer.empty();
		this.updateGradientBackground();
	
		this.stops.forEach((stop, index) => {
			const stopEl = document.createElement("div");
			stopEl.classList.add("gradient-stop");
			stopEl.style.left = `${stop.position * 100}%`;
	
			// === Create color input directly on stop ===
			const colorInput = document.createElement("input");
			colorInput.type = "color";
			colorInput.value = stop.color;
			colorInput.classList.add("inline-color-picker");
			colorInput.addEventListener("input", () => {
				this.stops[index].color = colorInput.value;
				this.updateGradientBackground();
				this.emitUpdate();
			});
			stopEl.appendChild(colorInput);
	
			// === Delete icon (if more than 2 stops) ===
			if (this.stops.length > 2) {
				const removeBtn = document.createElement("div");
				removeBtn.classList.add("gradient-stop-remove");
				removeBtn.textContent = "×";
				removeBtn.title = "Remove stop";
				removeBtn.setAttribute("aria-label", "Remove color stop");
				removeBtn.addEventListener("click", (e) => {
					e.stopPropagation();
					this.stops.splice(index, 1);
					this.selectedIndex = Math.max(0, this.selectedIndex - 1);
					this.renderStops();
					this.emitUpdate();
				});
				stopEl.appendChild(removeBtn);
			}
	
			// === Drag handler, skipping if clicking the color input ===
			stopEl.addEventListener("mousedown", (e: MouseEvent) => {
				const target = e.target as HTMLElement;
				if (target.tagName.toLowerCase() === "input") return; // Avoid dragging on color picker
				e.preventDefault();
				e.stopPropagation();
				this.draggingIndex = index;
				document.addEventListener("mousemove", this.onDragMove);
				document.addEventListener("mouseup", this.onDragEnd);
			});
	
			this.stopContainer.appendChild(stopEl);
		});
	}	

	private onDragMove = (e: MouseEvent) => {
		if (this.draggingIndex === null) return;
		const rect = this.gradientBar.getBoundingClientRect();
		const newX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
		const newPos = newX / rect.width;
		this.stops[this.draggingIndex].position = newPos;
		this.stops.sort((a, b) => a.position - b.position);
		this.selectedIndex = this.draggingIndex = this.stops.indexOf(this.stops.find(s => s.position === newPos)!);
		this.renderStops();
		this.emitUpdate();
	};

	private onDragEnd = () => {
		this.draggingIndex = null;
		document.removeEventListener("mousemove", this.onDragMove);
		document.removeEventListener("mouseup", this.onDragEnd);
	};

	private emitUpdate() {
		this.updateGradientBackground();
		this.onUpdate?.(this.stops.map(s => [s.position, s.color]));
	}

	private updateGradientBackground() {
		const sorted = [...this.stops].sort((a, b) => a.position - b.position);
		const gradient = `linear-gradient(to right, ${sorted.map(s => `${s.color} ${(s.position * 100).toFixed(2)}%`).join(", ")})`;
		this.gradientBar.style.background = gradient;
	}

	onClose() {
		this.contentEl.empty();
	}
}


// --- Exported function used in renderChartSettingsBlock.ts ---
export function renderCustomColorscaleSetting(
	block: HTMLElement,
	config: ChartConfig,
	plugin: ChartDashboardPlugin
) {
	const isHeatmap = config.chartType === "heatmap";
	if (!isHeatmap) return;

	const setting = new Setting(block)
		.setName("Custom heatmap colorscale")
		.setDesc("Define a custom gradient used for this heatmap.");
	
	setting.addToggle(toggle => {
		toggle
			.setTooltip("Enable/Disable custom colorscale")
			.setValue(config.useCustomColorscale ?? false)
			.onChange(async (value) => {
				config.useCustomColorscale = value;
				await plugin.saveSettings();
				updatePreview();
			});
	
		// Inline label before the toggle in the same control section
		const labelEl = document.createElement("label");
		labelEl.textContent = "Enable/Disable:";
		labelEl.classList.add("colorscale-toggle-label");
		toggle.toggleEl.parentElement?.insertBefore(labelEl, toggle.toggleEl);
	});
	
	setting.addButton(btn =>
		btn
		.setTooltip("Edit custom colorscale")
		.setButtonText("Edit").onClick(() => {
			new GradientModal(
				plugin.app,
				Array.isArray(config.heatmapCustomGradient)
					? config.heatmapCustomGradient
					: [],
					(colors) => {
						config.heatmapCustomGradient = colors;
						plugin.saveSettings();
						updatePreview(); // <- Final update on save
					},
					(colors) => {
						updatePreview(); // <- Live updates
					}					
			).open();			
		})
	);

	// === Create the gradient preview bar
	const previewBar = document.createElement("div");
	previewBar.classList.add("gradient-preview-bar");
	setting.settingEl.appendChild(previewBar);

	function updatePreview() {
		if (config.useCustomColorscale && Array.isArray(config.heatmapCustomGradient) && config.heatmapCustomGradient.length >= 2) {
			const sorted = [...config.heatmapCustomGradient].sort((a, b) => a[0] - b[0]);
			const gradient = `linear-gradient(to right, ${sorted
				.map(([pos, color]) => `${color} ${(pos * 100).toFixed(2)}%`)
				.join(", ")})`;
			previewBar.style.background = gradient;
			previewBar.textContent = "";
		} else {
			// Fallback for built-in Plotly colorscale — show name or neutral
			previewBar.style.background = "#ccc";
			previewBar.textContent = config.colorscale ?? "Default";
		}
	}	

	updatePreview();
}

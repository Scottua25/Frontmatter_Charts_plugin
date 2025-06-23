import { App, Plugin } from "obsidian";
import { chartRendererMap } from "./src/chartRendererMap";
import { DEFAULT_SETTINGS, ChartSettings } from "./src/settings";
import { HeatmapSettingTab } from "./src/settings-tab";
import { validateChartRoles } from "src/validateChartRoles";
import { NewChartModal } from "./src/newChartModal";

declare global {
	interface HTMLElement {
		createEl<K extends keyof HTMLElementTagNameMap>(
			tagName: K,
			options?: {
				cls?: string;
				text?: string;
			}
		): HTMLElementTagNameMap[K];

		createDiv(options?: { cls?: string }): HTMLDivElement;

		setAttr(name: string, value: string): void;
	}
}

function renderChart(app: App, el: HTMLElement, type: string, settings: ChartSettings) {
	const config = settings.chartTypes[type];
	if (!config) {
		el.createEl("div", { text: "No config found for chart type: " + type });
		return;
	}

	const chartType = config.chartType as keyof typeof chartRendererMap;
	const renderer = chartRendererMap[chartType];
	if (!renderer) {
		el.createEl("div", {
			text: `Unsupported chart type: ${config.chartType}`,
		});
		return;
	}

	const { valid, missing } = validateChartRoles(chartType, config);
	if (!valid) {
		el.createEl("div", {
			text: `Missing required fields for chart type "${chartType}": ${missing.join(", ")}`,
		});
		return;
	}

	renderer(app, el, type, settings);
}

export default class ChartDashboardPlugin extends Plugin {
	settings!: ChartSettings;
	public registeredProcessors: Record<string, (source: string, el: HTMLElement) => Promise<void>> = {};

	async onload() {
		console.log("Loading Frontmatter Charts Plugin");

		// Load settings
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		// Define and store the insert-chart processor
		this.registeredProcessors["insert-chart"] = async (source, el) => {
			const chartKey = source.trim().split("\n")[0].trim();
			const config = this.settings.chartTypes[chartKey];

			if (!config) {
				new NewChartModal(this.app, chartKey, this).open();
				el.createEl("div", {
					text: `Chart config '${chartKey}' not found. Opening configuration modal...`,
				});
				return;
			}

			if (!config.chartType || !(config.chartType in chartRendererMap)) {
				el.createEl("div", {
					text: `Missing or invalid chart config for '${chartKey}'`,
				});
				return;
			}

			try {
				el.setAttr("data-chart-key", chartKey);
				renderChart(this.app, el, chartKey, this.settings);
			} catch (err) {
				console.error(`Chart rendering failed for '${chartKey}':`, err);
				el.createEl("div", {
					text: `Chart rendering failed for '${chartKey}'. See console.`,
				});
			}
		};

		// Register the processor
		this.registerMarkdownCodeBlockProcessor("insert-chart", this.registeredProcessors["insert-chart"]);


		// Add settings tab
		this.addSettingTab(new HeatmapSettingTab(this.app, this));
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

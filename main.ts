import {
	App,
	Plugin,
	PluginSettingTab,
	TFile,
	TFolder,
	MarkdownPostProcessorContext,
	MarkdownRenderChild
} from "obsidian";
import { chartRendererMap } from "./src/chartRendererMap";
import { DEFAULT_SETTINGS, HeatmapSettings, HeatmapTypeConfig } from "./src/settings";
import { HeatmapSettingTab } from "./src/settings-tab";
import "./styles.css";
import Plotly from "plotly.js-dist-min";

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
	}
}

function getDataMap(app: App, config: HeatmapTypeConfig): Record<string, Record<string, number>> {
	const dataMap: Record<string, Record<string, number>> = {};

	if (config.folder) {
		const folder = app.vault.getAbstractFileByPath(config.folder);
		if (folder instanceof TFolder) {
			for (const file of folder.children) {
				if (file instanceof TFile && file.extension === "md") {
					const cache = app.metadataCache.getFileCache(file);
					const fm = cache?.frontmatter;
					if (!fm) continue;

					const date = fm.date || file.basename;
					if (typeof date !== "string") continue;

					dataMap[date] ??= {};

					for (const [field, cfg] of Object.entries(config.fields)) {
						if (cfg.enabled && typeof fm[field] === "number") {
							dataMap[date][field] = fm[field];
						}
					}
				}
			}
		}
	}

	return dataMap;
}

function renderChart(app: App, el: HTMLElement, type: string, settings: HeatmapSettings) {
	const config = settings.heatmapTypes[type];
	if (!config) {
	  el.createEl("div", { text: "No config found for chart type: " + type });
	  return;
	}
  
	const chartType = config.chartType as keyof typeof chartRendererMap;
	const renderer = chartRendererMap[chartType];
	if (!renderer) {
	  el.createEl("div", { text: `Unsupported chart type: ${config.chartType}` });
	  return;
	}
  
	renderer(app, el, type, settings);
  }
  
  export default class HeatmapDashboardPlugin extends Plugin {
	settings!: HeatmapSettings;

	async onload() {
		console.log("Loading Heatmap Dashboard Plugin");

		// Load settings
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		// Register markdown processors for each chart type
		Object.keys(this.settings.heatmapTypes).forEach((type) => {
			this.registerMarkdownCodeBlockProcessor(type, async (_source, el) => {
				const config = this.settings.heatmapTypes[type];

				if (!config || !config.chartType || !(config.chartType in chartRendererMap)) {
					el.createEl("div", { text: "Missing or invalid chart configuration." });
					return;
				}

				renderChart(this.app, el, type, this.settings);
			});
		});

		// Add settings tab
		this.addSettingTab(new HeatmapSettingTab(this.app, this));
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

import {
	App,
	Plugin,
	PluginSettingTab,
	TFile,
	TFolder,
	MarkdownPostProcessorContext,
	MarkdownRenderChild
} from "obsidian";

import { DEFAULT_SETTINGS, HeatmapSettings } from "./src/settings";
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

function renderHeatmap(app: App, el: HTMLElement, type: string, settings: HeatmapSettings) {
	const config = settings.heatmapTypes[type];
	if (!config || !config.fields) {
		el.createEl("div", { text: "Heatmap config missing." });
		return;
	}

	const dataMap: Record<string, Record<string, number>> = {};

	if (config.folder) {
		const folder = app.vault.getAbstractFileByPath(config.folder);
		if (folder instanceof TFolder) {
			for (const file of folder.children) {
				if (file instanceof TFile && file.extension === "md") {
					const cache = app.metadataCache.getFileCache(file);
					const fm = cache?.frontmatter;
					if (!fm) continue;
	
					// Infer date from frontmatter or filename
					const date = fm.date || file.basename; // assumes ISO date or similar
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
	
	let dates = Object.keys(dataMap).sort();
	const limit = config.limitDays ?? 0;
	if (limit > 0) {
		dates = dates.slice(-limit); // keep only the most recent N days
	}
	
	const fields = Object.keys(config.fields).filter(k => config.fields[k].enabled);	

	// Build the Z matrix: rows = fields, cols = dates
	const z: number[][] = fields.map(field =>
		dates.map(date => {
			const val = dataMap[date]?.[field] ?? 0;
			const rda = config.fields[field]?.rda ?? 1; // avoid division by zero
			return Math.round((val / rda) * 100);
		})
	);
	
	// Over 100% annotations
	const annotations = [];

	fields.forEach((field, rowIdx) => {
		dates.forEach((date, colIdx) => {
			const val = dataMap[date]?.[field] ?? 0;
			const rda = config.fields[field]?.rda ?? 1;
			const pct = (val / rda) * 100;

			if (pct > 100) {
				annotations.push({
					x: date,
					y: field,
					text: "X",
					showarrow: false,
					font: {
						color: config.fontColor || "#000",
						size: config.fontSize || 12,
					}
				});
			}
		});
	});

	// Plotly config
	const data = [{
		z,
		x: dates,
		y: fields,
		type: 'heatmap',
		colorscale: config.colorscale || 'YlGnBu',
		showscale: config.showScale ?? true,
		// zmax: Math.max(...z.flat()), // auto-scale unless overridden
		reversescale: config.reverseScale ?? false,
		zmin: 0,
		zmax: 100
	}];
	
	const layout = {
		title: `Heatmap: ${type}`,
		margin: { t: config.marginTop ?? 30, l: 120 },
		xaxis: {
			type: 'category',
			tickangle: -45,
			tickfont: { size: config.fontSize ?? 12 }
		},
		yaxis: {
			type: 'category',
			automargin: true,
			tickfont: { size: config.fontSize ?? 12 }
		},
		height: 50 + fields.length * 30,
		plot_bgcolor: config.backgroundColor ?? "rgba(0,0,0,0)",
		paper_bgcolor: config.backgroundColor ?? "rgba(0,0,0,0)",
		font: {
			color: config.fontColor ?? "#ffffff",
			size: config.fontSize ?? 12
		},
		annotations: {
		plot_bgcolor: config.backgroundColor || 'rgba(0,0,0,0)',
		font: {
			color: config.fontColor || "#000",
			size: config.fontSize || 12,
		},
		height: 50 + fields.length * 30
	}
	};
	

	const chartDiv = el.createDiv({ cls: "heatmap-chart" });
	// @ts-ignore
	Plotly.newPlot(chartDiv, data, layout, { displayModeBar: false });
}

export default class HeatmapDashboardPlugin extends Plugin {
	settings!: HeatmapSettings;

	async onload() {
		console.log("Loading Heatmap Dashboard Plugin");
	
		// Load settings
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	
		// Register code block processors
		Object.keys(this.settings.heatmapTypes).forEach((type) => {
			this.registerMarkdownCodeBlockProcessor(type, async (_source, el) => {
				renderHeatmap(this.app, el, type, this.settings);
			});			
		});
	
		// Add settings tab
		this.addSettingTab(new HeatmapSettingTab(this.app, this));
	}
	

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
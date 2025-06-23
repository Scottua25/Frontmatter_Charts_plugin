import { App, PluginSettingTab, Setting, MarkdownView } from "obsidian";
import type ChartDashboardPlugin from "../main";
import { renderChartSettingsBlock } from "../renderers/renderChartSettingsBlock";
import type { ChartConfig, ChartFieldConfig } from "./types";
import { updateFieldsFromFolder } from "../src/helpers/updateFieldsFromFolder";

export class HeatmapSettingTab extends PluginSettingTab {
	private async updateFieldsFromFolder(key: string, folderPath: string) {
		const config = this.plugin.settings.chartTypes[key];
		const updatedFields = await updateFieldsFromFolder(
			this.app,
			folderPath,
			config.fields as Record<string, ChartFieldConfig>
		);
		config.fields = updatedFields;
	}
	

	private _newHeatmapTypeName: string = "";

	private triggerMarkdownRefresh() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view && view.editor) {
			view.setViewData(view.getViewData(), false);
		}
	}

	plugin: ChartDashboardPlugin;

	constructor(app: App, plugin: ChartDashboardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const container = this.containerEl;
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
		container.createEl("h1", { text: "Chart Settings" });

		const h3 = document.createElement("h3");
		h3.textContent = "Charts";
		container.appendChild(h3);

		for (const [key, config] of Object.entries(this.plugin.settings.chartTypes)) {
			if (!config.chartType) {
				config.chartType = "heatmap";
			}
			await renderChartSettingsBlock(
				this.app,
				this.plugin,
				container,
				key,
				config as ChartConfig,
				() => this.display(),
				this.updateFieldsFromFolder.bind(this)
			);
		}
		
		// === Add New Chart Type UI ===
		new Setting(this.containerEl)
			.setName("Add New Chart")
			.setDesc(
				"Unique code block name (e.g., nutrients). This will be used to insert the chart into a note."
			)
			.addText((text) => {
				text.setPlaceholder("new-chart-name").onChange((value) => {
					this._newHeatmapTypeName = value.trim();
				});
			})
			.addButton((btn) => {
				btn.setButtonText("Add").onClick(async () => {
					const name = this._newHeatmapTypeName;
					if (!name || this.plugin.settings.chartTypes[name]) return;

					this.plugin.settings.chartTypes[name] = {
						fields: {},
						folder: "",
						limitDays: 0,
						chartType: "heatmap",
						chartColor: "#ff9900",
						fontColor: "#ffffff",
						fontSize: 12,
						marginTop: 30,
						backgroundColor: "rgba(0,0,0,0)",
						colorscale: "YlGnBu",
						reverseScale: false,
					};

					await this.plugin.saveSettings();
					this.display();
				});
			});
	}
}

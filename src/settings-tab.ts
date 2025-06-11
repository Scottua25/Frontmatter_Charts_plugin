import {
	App,
	PluginSettingTab,
	Setting,
	ToggleComponent,
	TextComponent,
	TFolder,
	TFile,
	parseYaml,
	MarkdownView,
	ButtonComponent
} from "obsidian";
import type ChartDashboardPlugin from "../main";
import { renderChartSettingsBlock } from "./chartSettingsBlock";

export class HeatmapSettingTab extends PluginSettingTab {
	private async updateFieldsFromFolder(key: string, folderPath: string) {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!(folder instanceof TFolder)) return;

		const props = new Set<string>();

		for (const file of folder.children) {
			if (file instanceof TFile && file.extension === "md") {
				const cache = this.app.metadataCache.getFileCache(file);
				const fm = cache?.frontmatter;
				if (fm && typeof fm === "object") {
					Object.keys(fm).forEach((key) => props.add(key));
				}
			}
		}		

		const config = this.plugin.settings.chartTypes[key];
		config.fields = {};
		props.forEach(p => {
			config.fields[p] = { enabled: true };
		});
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
		container.innerHTML = "";
		container.createEl("h1", { text: "Chart Settings" });	

		const h3 = document.createElement("h3");
		h3.textContent = "Charts";
		container.appendChild(h3);

		for (const [key, config] of Object.entries(this.plugin.settings.chartTypes)) {
			await renderChartSettingsBlock(
				this.app,
				this.plugin,
				container,
				key,
				config,
				() => this.display(),
				this.updateFieldsFromFolder.bind(this) 
			);
		}
		// === Add New Chart Type UI ===
		new Setting(this.containerEl)
			.setName("Add New Chart")
			.setDesc("Unique code block name (e.g., nutrients). This will be used to insert the chart into a note.")
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
						reverseScale: false
					};

					await this.plugin.saveSettings();
					this.display();
				});
			});
	}
}

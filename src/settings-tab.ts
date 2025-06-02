import {
	App,
	PluginSettingTab,
	Setting,
	ToggleComponent,
	TextComponent,
	TFolder,
	TFile,
	parseYaml
} from "obsidian";
import type HeatmapDashboardPlugin from "../main";

export class HeatmapSettingTab extends PluginSettingTab {
	private async updateFieldsFromFolder(key: string, folderPath: string) {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!(folder instanceof TFolder)) return;
	
		const props = new Set<string>();
	
		for (const file of folder.children) {
			if (file instanceof TFile && file.extension === "md") {
				const cache = this.app.metadataCache.getFileCache(file);
				const fm = cache?.frontmatter;
				if (fm) {
					Object.entries(fm).forEach(([k, v]) => {
						if (typeof v === "number" || typeof v === "boolean") props.add(k);
					});
				}
			}
		}
	
		const config = this.plugin.settings.heatmapTypes[key];
		config.fields = {};
		props.forEach(p => {
			config.fields[p] = { enabled: true };
		});
	}
	
	plugin: HeatmapDashboardPlugin;

	constructor(app: App, plugin: HeatmapDashboardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const container = this.containerEl as HTMLElement & {
			empty: () => void;
			createEl: (tag: keyof HTMLElementTagNameMap, options?: { text?: string }) => HTMLElement;
			createDiv: (options?: { cls?: string }) => HTMLDivElement;
		};
	
		container.empty();
		container.createEl("h2", { text: "Heatmap Chart Settings" });	
		
		const containerEl = this.containerEl as HTMLElement & {
			empty: () => void;
			createEl: HTMLElement["appendChild"];
			createDiv: HTMLElement["appendChild"];
		};

		container.empty?.();
		const h2 = document.createElement("h2");
		h2.textContent = "Heatmap Chart Settings";
		container.appendChild(h2);
	

		// Heatmap Types
		const h3 = document.createElement("h3");
		h3.textContent = "Heatmap Types";
		container.appendChild(h3);
	
		for (const [key, config] of Object.entries(this.plugin.settings.heatmapTypes)) {
			const block = document.createElement("div");
			block.classList.add("heatmap-config-block");
			container.appendChild(block);
			const h4 = document.createElement("h4");
			h4.textContent = `Type: ${key}`;
			block.appendChild(h4);

			// Vault Folder Path
			new Setting(block)
			.setName("Vault Folder Path")
			.setDesc("Folder to scan for frontmatter fields")
			.addText((text) => {
				text
					.setPlaceholder("e.g., Daily Notes")
					.setValue(config.folder || "")
					.onChange(async (value) => {
						config.folder = value.trim();
						await this.plugin.saveSettings();
					});
			})
			.addButton((btn) => {
				btn.setButtonText("Scan")
					.setCta()
					.onClick(async () => {
						await this.updateFieldsFromFolder(key, config.folder || "");
						await this.plugin.saveSettings();
						this.display(); // Refresh UI immediately after scan
					});
			});

			// Delete Button
			new Setting(block).addButton((btn) =>
				btn.setButtonText("Delete")
					.setWarning()
					.onClick(async () => {
						delete this.plugin.settings.heatmapTypes[key];
						await this.plugin.saveSettings();
						await this.updateFieldsFromFolder(key, ""); // <== trigger field discovery with default path
						await this.display();
					})
			);

			// Top Margin
			new Setting(block)
			.setName("Top Margin")
			.setDesc("Top space for chart title (px)")
			.addText(text => text
				.setPlaceholder("30")
				.setValue((config.marginTop ?? 30).toString())
				.onChange(async (val) => {
					const num = parseInt(val);
					if (!isNaN(num)) {
						config.marginTop = num;
						await this.plugin.saveSettings();
					}
				}));

			// Font color
			new Setting(block)
			.setName("Font color")
			.setDesc("Text color for values inside each heatmap cell.")
			.addText(text => text
				.setPlaceholder("#ffffff")
				.setValue(config.fontColor || "#ffffff")
				.onChange(async (value) => {
					config.fontColor = value;
					await this.plugin.saveSettings();
				}));

			// Font Size
			new Setting(block)
			.setName("Font Size")
			.setDesc("Font size for labels")
			.addText(text => text
				.setPlaceholder("12")
				.setValue((config.fontSize ?? 12).toString())
				.onChange(async (val) => {
					const num = parseInt(val);
					if (!isNaN(num)) {
						config.fontSize = num;
						await this.plugin.saveSettings();
					}
				}));

			// Background color
			new Setting(block)
			.setName("Background color")
			.setDesc("Overall background color or transparency for the chart (use rgba for transparency).")
			.addText(text => text
				.setPlaceholder("rgba(0,0,0,0)")
				.setValue(config.backgroundColor || "rgba(0,0,0,0)")
				.onChange(async (value) => {
					config.backgroundColor = value;
					await this.plugin.saveSettings();
				}));


			// Colorscale
			const colorOptions = [
				"YlGnBu", "Viridis", "Hot", "Blues", "Greens", "Reds",
				"Jet", "Picnic", "Portland", "Electric", "Cividis"
			];
					
			new Setting(block)
				.setName("Colorscale")
				.setDesc("Plotly color scheme")
				.addDropdown(drop => {
					colorOptions.forEach(c => drop.addOption(c, c));
					drop.setValue(config.colorscale || "YlGnBu")
						.onChange(async val => {
							config.colorscale = val;
							await this.plugin.saveSettings();
						});
				});

			// Reverse Colorscale
			new Setting(block)
				.setName("Reverse Colorscale")
				.setDesc("Invert the heatmap color direction")
				.addToggle(toggle => toggle
					.setValue(config.reverseScale ?? false)
					.onChange(async (val) => {
						config.reverseScale = val;
						await this.plugin.saveSettings();
					}));

			// Date limit
			new Setting(block)
			.setName("Limit to most recent days")
			.setDesc("Only include the most recent X days (0 = no limit)")
			.addText((text) =>
				text
					.setPlaceholder("e.g., 7")
					.setValue((config.limitDays ?? 0).toString())
					.onChange(async (value) => {
						config.limitDays = parseInt(value) || 0;
						await this.plugin.saveSettings();
				}));

			// Create collapsible container for YAML field settings
			const detailsEl = document.createElement("details");
			detailsEl.classList.add("yaml-field-toggle");
			block.appendChild(detailsEl);

			// Optional summary label
			const summaryEl = document.createElement("summary");
			summaryEl.textContent = "Detected YAML Fields";
			summaryEl.style.fontWeight = "bold";
			detailsEl.appendChild(summaryEl);
			detailsEl.open = true;

			// Attempt to scan YAML frontmatter
			if (config.folder) {
				const folder = this.app.vault.getAbstractFileByPath(config.folder);
				if (folder instanceof TFolder) {
					const fieldSet: Set<string> = new Set();

					for (const f of folder.children) {
						if (f instanceof TFile && f.extension === "md") {
							const content = await this.app.vault.read(f);
							const match = /^---\n([\s\S]*?)\n---/.exec(content);
							if (match) {
								try {
									const frontmatter = parseYaml(match[1]);
									if (frontmatter && typeof frontmatter === "object") {
										Object.keys(frontmatter).forEach((k) => fieldSet.add(k));
									}
								} catch (_) {}
							}
						}
					}

					const sortedFields = Array.from(fieldSet).sort();
					for (const field of sortedFields) {
						const setting = new Setting(detailsEl).setName(field);

						// Enable checkbox
						setting.addToggle((toggle: ToggleComponent) =>
							toggle
								.setValue(config.fields?.[field]?.enabled ?? false)
								.onChange(async (val) => {
									if (!config.fields) config.fields = {};
									if (!config.fields[field]) config.fields[field] = { enabled: false };
									config.fields[field].enabled = val;
									await this.plugin.saveSettings();
								})
						);

						// RDA input if numeric
						setting.addText((text: TextComponent) =>
							text
								.setPlaceholder("Target")
								.setValue(config.fields?.[field]?.rda?.toString() || "")
								.onChange(async (val) => {
									if (!config.fields) config.fields = {};
									if (!config.fields[field]) config.fields[field] = { enabled: false };
									const num = Number(val);
									if (!isNaN(num)) config.fields[field].rda = num;
									else delete config.fields[field].rda;
									await this.plugin.saveSettings();
								})
						);
					}
				}
			}
		}
	
		// Add new heatmap type
		new Setting(containerEl)
			.setName("Add New Heatmap Type")
			.setDesc("Unique code block name (e.g., nutrients)")
			.addText((text) =>
				text.setPlaceholder("new-heatmap-type").onChange((value) => (this._newHeatmapTypeName = value.trim()))
			)
			.addButton((btn) =>
				btn.setButtonText("Add").onClick(async () => {
					const name = this._newHeatmapTypeName;
					if (!name || this.plugin.settings.heatmapTypes[name]) return;

					this.plugin.settings.heatmapTypes[name] = {
						fields: {},
						folder: "",
						limitDays: 0 // <-- new required property
					};					
					await this.plugin.saveSettings();
					await this.display();
				})
			);
	}

	private _newHeatmapTypeName: string = "";
}

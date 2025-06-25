import {
	App,
	Modal,
    Setting,
    Notice
} from "obsidian";
import { updateFieldsFromFolder } from "../src/helpers/updateFieldsFromFolder";
import type { ChartConfig, ChartFieldConfig, ChartType } from "./types";
import type ChartDashboardPlugin from "../main";
import { renderFolderSetting } from "../src/settings-sections/folderSetting";
import { renderChartTypeSetting } from "../src/settings-sections/chartTypeSetting";
import { renderChartStyleSetting } from "../src/settings-sections/chartStyleSetting";
import { renderHeatmapSettings } from "../src/settings-sections/heatmapSettings";
import { renderMarginSetting } from "../src/settings-sections/marginSetting";
import { renderFontSettings } from "../src/settings-sections/fontSettings";
import { renderColorSettings } from "../src/settings-sections/colorSettings";
import { renderSortOrderSetting } from "../src/settings-sections/sortOrderSettings";
import { renderLimitEntriesSetting as renderLimitEntriesSetting } from "./settings-sections/limitEntriesSetting";
import type { ChartTypeConfig } from "../src/settings";

export class NewChartModal extends Modal {
	private chartId: string;
	private plugin: ChartDashboardPlugin;
	private tempConfig: ChartConfig;

	constructor(app: App, chartId: string, plugin: ChartDashboardPlugin) {
		super(app);
		this.chartId = chartId;
		this.plugin = plugin;

		// Initialize in-memory config
		this.tempConfig = {
			chartType: 'selectedType' as ChartType,
			folder: "",
			fields: {},
			roleFields: [],
			fontSize: 12,
			fontColor: "#ffffff",
			backgroundPageColor: "#000000",
			backgroundChartColor: "#000000",
			marginTop: 20,
			cellHeight: 20,
			limitDays: 0
		};
	}

	async onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: `Create new chart: ${this.chartId}` });
    
        const block = contentEl.createDiv({ cls: "heatmap-config-block" });   
    
        // === Role Field Renderer (defined early so it can be passed to others)
        const updateRoleFields = async () => {
            const updatedFieldKeys = Object.keys(this.tempConfig.fields || {});
            while (roleFieldsContainer.firstChild) {
                roleFieldsContainer.removeChild(roleFieldsContainer.firstChild);
            }        
    
            const { renderChartRoleFields } = await import("../renderers/renderChartRoleFields");
            renderChartRoleFields(
                roleFieldsContainer,
                this.tempConfig.chartType,
                this.tempConfig,
                updatedFieldKeys,
                this.plugin,
                updateRoleFields
            );
        };
    
        // === Folder scan + re-render
        const updateFieldsAndRender = async (key: string, folder: string) => {
            this.tempConfig.fields = await updateFieldsFromFolder(
                this.app,
                folder,
                this.tempConfig.fields as Record<string, ChartFieldConfig>
            );
            await updateRoleFields();
        };
    
        // === Render UI Blocks ===
        renderFolderSetting(block, this.tempConfig, this.plugin, this.chartId, updateFieldsAndRender, updateRoleFields);
        renderChartTypeSetting(block, this.tempConfig, this.plugin, updateRoleFields);
        renderChartStyleSetting(block, this.tempConfig, this.plugin, updateRoleFields);
        renderSortOrderSetting(block, this.tempConfig, this.plugin.saveSettings.bind(this.plugin), updateRoleFields);
        renderHeatmapSettings(block, this.tempConfig, this.plugin);

        // === Create Role Fields Container AFTER sortOrder and heatmapSettings ===
        const roleFieldsWrapper = block.createDiv({ cls: "chart-role-fields" });
        const roleFieldsContainer = roleFieldsWrapper.createDiv({ cls: "role-fields-container" });
        const limitEntriesContainer = block.createDiv({ cls: "limit-entries-setting" });

        await updateRoleFields(); // Initial render

        renderLimitEntriesSetting(limitEntriesContainer, this.tempConfig, this.plugin);
        renderMarginSetting(block, this.tempConfig, this.plugin);
        renderFontSettings(block, this.tempConfig, this.plugin);

        const colorSettingsContainer = block.createDiv({ cls: "color-settings-container" });
        const refreshColorSettings = () => {
            while (colorSettingsContainer.firstChild) {
                colorSettingsContainer.removeChild(colorSettingsContainer.firstChild);
            }
            renderColorSettings(colorSettingsContainer, this.tempConfig, this.plugin);
        };   
            await updateRoleFields();
            await refreshColorSettings();
    
        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Create Chart")
                    .setCta()
                    .onClick(async () => {
                        if (!this.tempConfig.folder) {
                            new Notice("Please enter a folder path.");
                            return;
                        }
                        this.plugin.settings.chartTypes[this.chartId] = this.tempConfig as ChartTypeConfig;
                        await this.plugin.saveSettings();
                        new Notice(`Chart '${this.chartId}' created.`);
                        this.close();
                    })
            );
    }            

	onClose() {
		while (this.contentEl.firstChild) {
			this.contentEl.removeChild(this.contentEl.firstChild);
		}
	}
}

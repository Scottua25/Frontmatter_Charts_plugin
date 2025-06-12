import {
	App,
	Setting,
	DropdownComponent
} from "obsidian";
import type ChartDashboardPlugin from "../main";
import { renderFolderSetting } from "../src/settings-sections/folderSetting";
import { renderChartTypeSetting } from "../src/settings-sections/chartTypeSetting";
import { renderChartStyleSetting } from "../src/settings-sections/chartStyleSetting";
import { renderHeatmapSettings } from "../src/settings-sections/heatmapSettings";
import { renderTopMarginSetting } from "../src/settings-sections/topMarginSetting";
import { renderFontSettings } from "../src/settings-sections/fontSettings";
import { renderColorSettings } from "../src/settings-sections/colorSettings";
import { renderChartRoleFields } from "../renderers/renderChartRoleFields";
import { renderDeleteChartSetting } from "../src/settings-sections/deleteChartSetting";

// Main exported function
export async function renderChartSettingsBlock(
	app: App,
	plugin: ChartDashboardPlugin,
	container: HTMLElement,
	key: string,
	config: any,
	refresh: () => void,
	updateFieldsFromFolder: (key: string, folder: string) => Promise<void>
): Promise<void> {
	const detailsEl = document.createElement("details");
	detailsEl.classList.add("chart-config-toggle");
	container.appendChild(detailsEl);

	const summaryEl = document.createElement("summary");
	summaryEl.textContent = `${key}`;
	summaryEl.classList.add("chart-summary-header");
	detailsEl.appendChild(summaryEl);

	// Preserve open/close state visually
	const isOpen = detailsEl.open;
	requestAnimationFrame(() => {
		detailsEl.open = isOpen;
	});

	const block = document.createElement("div");
	block.classList.add("heatmap-config-block");
	detailsEl.appendChild(block);

    let roleFieldsContainer: HTMLElement;

	function updateRoleFields() {
		const updatedFields = Object.keys(config.fields || {});
		const scrollTop = roleFieldsContainer.scrollTop;

		renderChartRoleFields(
			roleFieldsContainer,
			config.chartType,
			config,
			updatedFields,
			plugin,
			updateRoleFields
		);

		requestAnimationFrame(() => {
			roleFieldsContainer.scrollTop = scrollTop;
		});
	}

	// === Render UI Sections ===
	renderFolderSetting(block, config, plugin, key, updateFieldsFromFolder, updateRoleFields);
	renderChartTypeSetting(block, config, plugin, updateRoleFields);
	renderChartStyleSetting(block, config, plugin, updateRoleFields);
	renderHeatmapSettings(block, config, plugin);

    const rolesContainer = block.createDiv({ cls: "chart-role-fields" });
    roleFieldsContainer = rolesContainer.createDiv({ cls: "role-fields-container" });
    updateRoleFields();

	renderTopMarginSetting(block, config, plugin);
	renderFontSettings(block, config, plugin);
	renderColorSettings(block, config, plugin);
	renderDeleteChartSetting(block, key, plugin, refresh);
}

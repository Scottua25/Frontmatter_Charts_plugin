import {
	App,
	Setting,
	ToggleComponent,
	TextComponent,
	ButtonComponent,
	TFolder,
	TFile,
	parseYaml
} from "obsidian";
import type ChartDashboardPlugin from "../main";
import { parseRGBA, rgbToHex, hexToRgb, addColorWithAlphaSetting, addInlineColorPicker } from "./colorUtils";
import { chartRoleDefinitions } from "./chartRoles";
import { renderChartRoleFields } from "../renderers/renderChartRoleFields";
import { chartRendererMap } from "../src/chartRendererMap";

// Must be async because we use await inside
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
	// detailsEl.open = true; // or false if you want them collapsed by default
	container.appendChild(detailsEl);
	
	const summaryEl = document.createElement("summary");
	summaryEl.textContent = `${key}`;
	summaryEl.style.fontWeight = "bold";
	summaryEl.style.marginBottom = "1em";
	detailsEl.appendChild(summaryEl);
	const isOpen = detailsEl.open;
		//refresh();
		requestAnimationFrame(() => {
			detailsEl.open = isOpen;
		});
	
	// Main block inside the collapsible
	const block = document.createElement("div");
	block.classList.add("heatmap-config-block");
	detailsEl.appendChild(block);

	const rolesContainer = block.createDiv({ cls: "chart-role-fields" });
	

    let colorscaleSetting: Setting;
    let reverseScaleSetting: Setting;
    let chartColorSetting: Setting;
    let heatmapCellHeightSetting: Setting;

	const folderSetting = new Setting(block)
		.setName("Vault Folder Path")
		.setDesc("Folder to scan for frontmatter fields");

	folderSetting.addText((text) => {
		text
			.setPlaceholder("e.g., Daily Notes")
			.setValue(config.folder || "")
			.onChange(async (value) => {
				config.folder = value.trim();
				await plugin.saveSettings();
				// refresh();
			});
	});

	folderSetting.addButton((btn: ButtonComponent) => {
		btn.setButtonText("Scan")
			.setCta()
			.onClick(async () => {
                await updateFieldsFromFolder(key, config.folder || "");
					const updatedFields = Object.keys(config.fields || {});
					renderChartRoleFields(roleFieldsContainer, config.chartType, config, updatedFields, plugin);
				await plugin.saveSettings();
				//refresh();
			});
	});

// === Chart Type Dropdown ===
new Setting(block)
	.setName("Chart Type")
	.setDesc("Select chart visualization")
	.addDropdown(drop => {
		const chartTypes = Object.keys(chartRendererMap);
		chartTypes.forEach(type =>
			drop.addOption(type, type.charAt(0).toUpperCase() + type.slice(1))
		);
		drop.setValue(config.chartType || "heatmap")
			.onChange(async (val) => {
				config.chartType = val;
				await plugin.saveSettings();
				updateAxisVisibility();
				const updatedFields = Object.keys(config.fields || {});
				renderChartRoleFields(roleFieldsContainer, val, config, updatedFields, plugin);
				//refresh();
			});
	});

    // === Heatmap Cell Height ===
    if (config.chartType === "heatmap") {
        heatmapCellHeightSetting = new Setting(block)
            .setName("Heatmap Cell Height")
            .setDesc("Pixel height per row in the heatmap")
            .addText((text) => {
                text.setPlaceholder("30")
                    .setValue((config.cellHeight ?? 30).toString())
                    .onChange(async (val) => {
                        const parsed = parseInt(val);
                        if (!isNaN(parsed)) {
                            config.cellHeight = parsed;
                            await plugin.saveSettings();
                            // refresh();
                        }
                    });
            });
    }

const roleFieldsContainer = block.createDiv({ cls: "role-fields-container" });

	new Setting(block)
		.setName("Top Margin")
		.setDesc("Top space for chart title (px)")
		.addText(text => {
			text
				.setPlaceholder("30")
				.setValue((config.marginTop ?? 30).toString())
				.onChange(async (val) => {
					const num = parseInt(val);
					if (!isNaN(num)) {
						config.marginTop = num;
						await plugin.saveSettings();
						// refresh();
					}
				});
		});

        const fontColorSetting = new Setting(block)
        .setName("Font Color")
        .setDesc("Text color for values inside the chart")
        .addText(text => {
            text
                .setPlaceholder("#ffffff")
                .setValue(config.fontColor || "#ffffff")
                .onChange(async (value) => {
                    config.fontColor = value;
                    await plugin.saveSettings();
                });
        });
    
    addInlineColorPicker(
        fontColorSetting.controlEl,
        config.fontColor || "#ffffff",
        async (val) => {
            config.fontColor = val;
            const input = fontColorSetting.controlEl.querySelector("input[type='text']") as HTMLInputElement;
            if (input) input.value = val;
            await plugin.saveSettings();
        }
    );     

	new Setting(block)
		.setName("Font Size")
		.setDesc("Font size for labels")
		.addText(text => {
			text
				.setPlaceholder("12")
				.setValue((config.fontSize ?? 12).toString())
				.onChange(async (val) => {
					const num = parseInt(val);
					if (!isNaN(num)) {
						config.fontSize = num;
						await plugin.saveSettings();
						// refresh();
					}
				});
		});
        
        const isHeatmap = config.chartType === "heatmap";

        addColorWithAlphaSetting(
            block,
            isHeatmap ? "Background Color" : "Page Background",
            isHeatmap
                ? "Background color behind the entire heatmap."
                : "Color surrounding the entire chart (canvas area).",
            config.backgroundPageColor || "rgba(0,0,0,0)",
            async (val) => {
                config.backgroundPageColor = val;
                await plugin.saveSettings();
            }
        );
        
        if (!isHeatmap) {
            addColorWithAlphaSetting(
                block,
                "Chart Area Background",
                "Color behind bars/lines inside the chart box.",
                config.backgroundPageColor || "rgba(0,0,0,0)",
                async (val) => {
                    config.backgroundPageColor = val;
                    await plugin.saveSettings();
                }
            );
        }        

        const colorOptions = [
            "YlGnBu", "Viridis", "Hot", "Blues", "Greens", "Reds",
            "Jet", "Picnic", "Portland", "Electric", "Cividis"
        ];
        
        // === Colorscale (Heatmap only)
        colorscaleSetting = new Setting(block)
            .setName("Colorscale")
            .setDesc("Plotly color scheme")
            .addDropdown((drop) => {
                colorOptions.forEach(c => drop.addOption(c, c));
                drop.setValue(config.colorscale || "YlGnBu")
                    .onChange(async val => {
                        config.colorscale = val;
                        await plugin.saveSettings();
                        //refresh();
                    });
            });
        
        // === Reverse Scale (Heatmap only)
        reverseScaleSetting = new Setting(block)
            .setName("Reverse Colorscale")
            .setDesc("Invert the heatmap color direction")
            .addToggle(toggle => {
                toggle
                    .setValue(config.reverseScale ?? false)
                    .onChange(async (val) => {
                        config.reverseScale = val;
                        await plugin.saveSettings();
                        //refresh();
                    });
            });
        
        // === Chart Color (Bar/Line only)
        chartColorSetting = new Setting(block)
        .setName("Chart Color")
        .setDesc("Primary color for bar or line charts")
        .addText(text => {
            text
                .setPlaceholder("#ff9900")
                .setValue(config.chartColor || "#ff9900")
                .onChange(async (val) => {
                    config.chartColor = val;
                    await plugin.saveSettings();
                });
        });
    
    addInlineColorPicker(
        chartColorSetting.controlEl,
        config.chartColor || "#ff9900",
        async (val) => {
            config.chartColor = val;
            const textField = chartColorSetting.controlEl.querySelector("input[type='text']") as HTMLInputElement;
            if (textField) textField.value = val;
            await plugin.saveSettings();
        }
    );
        

const availableFields = Object.keys(config.fields || {});
renderChartRoleFields(roleFieldsContainer, config.chartType, config, availableFields, plugin);

		// === Delete Chart Button
		const deleteSetting = new Setting(block)
		.setName("Delete Chart")
		.setDesc("Delete this chart. CANNOT BE UNDONE! BE SURE!")
		deleteSetting.addButton((btn) =>
			btn.setButtonText("Delete")
				.setWarning()
				.onClick(async () => {
					delete plugin.settings.chartTypes[key];
					await plugin.saveSettings();
					refresh();
				})
		);

        // === Visibility Controller
        function updateAxisVisibility() {
            const isHeatmap = config.chartType === "heatmap";
            const isBarOrLine = config.chartType === "bar" || config.chartType === "line";
            const hasFields = Object.keys(config.fields).length > 0;

            chartColorSetting.settingEl.style.display = isBarOrLine ? "" : "none";
            colorscaleSetting.settingEl.style.display = isHeatmap ? "" : "none";
            reverseScaleSetting.settingEl.style.display = isHeatmap ? "" : "none";
            if (heatmapCellHeightSetting)
                heatmapCellHeightSetting.settingEl.style.display = isHeatmap ? "" : "none";
        }
        
        // Finally, call once to initialize visibility
        updateAxisVisibility();        
}

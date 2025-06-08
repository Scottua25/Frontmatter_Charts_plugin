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
import type HeatmapDashboardPlugin from "../main";
import { parseRGBA, rgbToHex, hexToRgb, addColorWithAlphaSetting, addInlineColorPicker } from "./colorUtils";

// Must be async because we use await inside
export async function renderChartSettingsBlock(
	app: App,
	plugin: HeatmapDashboardPlugin,
	container: HTMLElement,
	key: string,
	config: any,
	refresh: () => void,
	updateFieldsFromFolder: (key: string, folder: string) => Promise<void>
): Promise<void> {

	const block = document.createElement("div");
	block.classList.add("heatmap-config-block");
	container.appendChild(block);

	const h4 = document.createElement("h4");
	h4.textContent = `Type: ${key}`;
	block.appendChild(h4);

    let colorscaleSetting: Setting;
    let reverseScaleSetting: Setting;
    let chartColorSetting: Setting;
    let heatmapCellHeightSetting: Setting;

// === Chart Type Dropdown ===
new Setting(block)
	.setName("Chart Type")
	.setDesc("Select chart visualization")
	.addDropdown(drop => {
		const options = ["heatmap", "bar", "line"];
		options.forEach(o => drop.addOption(o, o));
		drop.setValue(config.chartType || "heatmap")
			.onChange(async (val) => {
				config.chartType = val;
				await plugin.saveSettings();
				updateAxisVisibility();
				refresh();
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

// === X-Axis Field ===
const xFieldSetting = new Setting(block)
	.setName("X-Axis Field")
	.setDesc("Field to use for X-axis")
	.addDropdown(drop => {
		Object.keys(config.fields).forEach(field => drop.addOption(field, field));
		drop.setValue(config.xField || "")
			.onChange(async val => {
				config.xField = val;
				await plugin.saveSettings();
				refresh();
			});
	});
const xFieldEl = xFieldSetting.settingEl;

// === Y-Axis Field ===
const yFieldSetting = new Setting(block)
	.setName("Y-Axis Field")
	.setDesc("Field to use for Y-axis")
	.addDropdown(drop => {
		Object.keys(config.fields).forEach(field => drop.addOption(field, field));
		drop.setValue(config.yField || "")
			.onChange(async val => {
				config.yField = val;
				await plugin.saveSettings();
				refresh();
			});
	});
const yFieldEl = yFieldSetting.settingEl;

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
				await plugin.saveSettings();
				refresh();
			});
	});

	new Setting(block).addButton((btn) =>
		btn.setButtonText("Delete")
			.setWarning()
			.onClick(async () => {
				delete plugin.settings.heatmapTypes[key];
				await plugin.saveSettings();
				refresh();
			})
	);

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
                        refresh();
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
                        refresh();
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
        
const detailsEl = document.createElement("details");
detailsEl.classList.add("yaml-field-toggle");
block.appendChild(detailsEl);

const summaryEl = document.createElement("summary");
summaryEl.textContent = "Detected YAML Fields";
summaryEl.style.fontWeight = "bold";
detailsEl.appendChild(summaryEl);
// detailsEl.open = true;

if (config.fields && Object.keys(config.fields).length > 0) {
	const sortedFields = Object.keys(config.fields).sort();
	for (const field of sortedFields) {
		const setting = new Setting(detailsEl).setName(field);

		setting.addToggle((toggle: ToggleComponent) => {
			toggle
				.setValue(config.fields[field].enabled ?? false)
				.onChange(async (val) => {
					config.fields[field].enabled = val;
					await plugin.saveSettings();
				});
		});

		setting.addText((text: TextComponent) => {
			text
				.setPlaceholder("Target")
				.setValue(config.fields[field].rda?.toString() || "")
				.onChange(async (val) => {
					const num = Number(val);
					if (!isNaN(num)) config.fields[field].rda = num;
					else delete config.fields[field].rda;
					await plugin.saveSettings();
				});
		});
	}
}

        // === Visibility Controller
        function updateAxisVisibility() {
            const isHeatmap = config.chartType === "heatmap";
            const isBarOrLine = config.chartType === "bar" || config.chartType === "line";
            const hasFields = Object.keys(config.fields).length > 0;
        
            xFieldEl.style.display = (!isHeatmap && hasFields) ? "" : "none";
            yFieldEl.style.display = (!isHeatmap && hasFields) ? "" : "none";
            chartColorSetting.settingEl.style.display = isBarOrLine ? "" : "none";
            colorscaleSetting.settingEl.style.display = isHeatmap ? "" : "none";
            reverseScaleSetting.settingEl.style.display = isHeatmap ? "" : "none";
            if (heatmapCellHeightSetting)
                heatmapCellHeightSetting.settingEl.style.display = isHeatmap ? "" : "none";
        }
        
        // Finally, call once to initialize visibility
        updateAxisVisibility();        
}

import { App, MarkdownView, Notice, Setting } from "obsidian";
import type { ChartConfig } from "../types";
import type ChartDashboardPlugin from "../../main";

export async function renderApplyChartSettings(
	block: HTMLElement,
	key: string,
	config: ChartConfig,
	app: App,
	plugin: ChartDashboardPlugin
) {
	new Setting(block)
		.setName("Apply Settings")
		.setDesc("Apply changes to this chart in the currently open note.")
		.addButton((btn) => {
			btn.setButtonText("Apply").onClick(async () => {
				const view = app.workspace.getMostRecentLeaf()?.view;

				if (!(view instanceof MarkdownView)) {
					new Notice("Please focus a markdown note first.");
					return;
				}

				if (view.getMode() !== "preview") {
					new Notice("Note must be in Reading Mode (Preview) to update chart.");
					return;
				}

				const container = view.contentEl;
                const chartContainers = container.querySelectorAll<HTMLElement>(`[data-chart-key="${key}"]`);
					console.log(`[ApplyChartSettings] Found ${chartContainers.length} chart containers with data-chart-key="${key}"`);

					if (chartContainers.length === 0) {
						new Notice(`Chart '${key}' not found in current note.`);
						return;
					}

					for (const chartContainer of Array.from(chartContainers)) {
						while (chartContainer.firstChild) {
							chartContainer.removeChild(chartContainer.firstChild);
						}
						await plugin.registeredProcessors["insert-chart"](key, chartContainer);
					}

					new Notice(`Applied settings to chart '${key}'.`);

			});
		});
}

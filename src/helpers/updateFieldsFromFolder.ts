import { App, TFolder, TFile } from "obsidian";
import type { ChartFieldConfig } from "../types";

export async function updateFieldsFromFolder(
	app: App,
	folderPath: string,
	existingFields: Record<string, ChartFieldConfig>
): Promise<Record<string, ChartFieldConfig>> {
	const folder = app.vault.getAbstractFileByPath(folderPath);
	if (!(folder instanceof TFolder)) return existingFields;

	const props = new Set<string>();

	for (const file of folder.children) {
		if (file instanceof TFile && file.extension === "md") {
			const cache = app.metadataCache.getFileCache(file);
			const fm = cache?.frontmatter;
			if (fm && typeof fm === "object") {
				Object.keys(fm).forEach((key) => props.add(key));
			}
		}
	}

	const newFields: Record<string, ChartFieldConfig> = {};
	props.forEach((p) => {
		newFields[p] = {
			...existingFields[p],
			enabled: existingFields[p]?.enabled ?? false,
		};
	});

	return newFields;
}

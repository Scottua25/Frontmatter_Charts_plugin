import { 
    App,
    TFolder,
    TFile
        } from "obsidian";

export function getDataMap(app: App, config: any): Record<string, any> {
	const dataMap: Record<string, any> = {};

	// Traverse vault and extract frontmatter data from files
	const folder = app.vault.getAbstractFileByPath(config.folder);
	if (folder instanceof TFolder) {
		for (const file of folder.children) {
			if (file instanceof TFile && file.extension === "md") {
				const cache = app.metadataCache.getFileCache(file);
				const fm = cache?.frontmatter;
				if (fm) {
					const date = fm.date || file.basename;
					dataMap[date] = fm;
				}
			}
		}
	}

	return dataMap;
}

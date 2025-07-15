import {
	AbstractInputSuggest,
	App,
	TFolder,
	TextComponent,
	Setting,
	ButtonComponent,
} from "obsidian";
import type { FolderConfig } from "src/types";

class FolderSuggest extends AbstractInputSuggest<TFolder> {
	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
	}

	getSuggestions(inputStr: string): TFolder[] {
		const lower = inputStr.toLowerCase();
		return this.app.vault.getAllLoadedFiles()
			.filter((f): f is TFolder =>
				f instanceof TFolder && f.path.toLowerCase().includes(lower)
			);
	}

	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.textContent = folder.path;
	}

	selectSuggestion(folder: TFolder): void {
		this.setValue(folder.path);
		this.close();
	}
}

export function renderFolderSetting(
	block: HTMLElement,
	config: FolderConfig,
	plugin: { app: App; saveSettings: () => Promise<void> },
	key: string,
	updateFieldsFromFolder: (key: string, folder: string) => Promise<void>,
	updateRoleFields: () => void
) {
	const folderSetting = new Setting(block)
		.setName("Vault folder path")
		.setDesc("Folder to scan for frontmatter fields");

	folderSetting.addText((text: TextComponent) => {
		text
			.setPlaceholder("e.g., Daily Notes")
			.setValue(config.folder || "")
			.onChange(async (value: string) => {
				config.folder = value.trim();
				await plugin.saveSettings();
				await updateFieldsFromFolder(key, config.folder);
				await updateRoleFields();
			});

		new FolderSuggest(plugin.app, text.inputEl);
	});

	folderSetting.addButton((btn: ButtonComponent) => {
		btn.setButtonText("Scan")
			.setCta()
			.onClick(async () => {
				await updateFieldsFromFolder(key, config.folder || "");
				updateRoleFields();
				await plugin.saveSettings();
			});
	});
}

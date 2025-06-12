import { Setting, ButtonComponent } from "obsidian";

export function renderFolderSetting(
	block: HTMLElement,
	config: any,
	plugin: { saveSettings: () => Promise<void> },
	key: string,
	updateFieldsFromFolder: (key: string, folder: string) => Promise<void>,
	updateRoleFields: () => void
) {
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
			});
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

import {
	App,
	TFolder,
	TextComponent,
	Scope,
	Setting,
	ButtonComponent,
} from "obsidian";
import { createPopper, type Instance as PopperInstance } from "@popperjs/core";
import type { FolderConfig } from "src/types";

abstract class TextInputSuggest<T> {
	protected app: App;
	protected inputEl: HTMLInputElement;
	private popper!: PopperInstance;
	private scope: Scope;
	private suggestEl: HTMLElement;
	private suggestionsContainer: HTMLDivElement;
	private suggestions: T[] = [];
	private suggestionEls: HTMLDivElement[] = [];
	private selectedItem: number = 0;

	constructor(app: App, inputEl: HTMLInputElement) {
		this.app = app;
		this.inputEl = inputEl;
		this.scope = new Scope();

		this.suggestEl = document.createElement("div");
		this.suggestEl.classList.add("suggestion-container");

		this.suggestionsContainer = document.createElement("div");
		this.suggestionsContainer.classList.add("suggestion");
		this.suggestEl.appendChild(this.suggestionsContainer);

		this.scope.register([], "ArrowUp", (evt) => {
			if (!evt.isComposing) {
				this.setSelectedItem(this.selectedItem - 1, true);
				return false;
			}
		});

		this.scope.register([], "ArrowDown", (evt) => {
			if (!evt.isComposing) {
				this.setSelectedItem(this.selectedItem + 1, true);
				return false;
			}
		});

		this.scope.register([], "Enter", (evt) => {
			if (!evt.isComposing) {
				this.useSelectedItem(evt);
				return false;
			}
		});

		this.scope.register([], "Escape", this.close.bind(this));

		this.inputEl.addEventListener("input", this.onInputChanged.bind(this));
		this.inputEl.addEventListener("focus", this.onInputChanged.bind(this));
		this.inputEl.addEventListener("blur", this.close.bind(this));

		this.suggestEl.addEventListener("mousedown", (e: MouseEvent) => {
			e.preventDefault();
		});
	}

	private onInputChanged(): void {
		const inputStr = this.inputEl.value;
		const suggestions = this.getSuggestions(inputStr);

		if (suggestions.length > 0) {
			this.suggestions = suggestions;
			this.renderSuggestions();
			this.open();
		} else {
			this.close();
		}
	}

	private renderSuggestions() {
		while (this.suggestionsContainer.firstChild) {
			this.suggestionsContainer.removeChild(this.suggestionsContainer.firstChild);
		}
		this.suggestionEls = [];

		this.suggestions.forEach((item, index) => {
			const el = document.createElement("div");
			el.classList.add("suggestion-item");
			this.renderSuggestion(item, el);

			el.addEventListener("click", (e) => {
				e.preventDefault();
				this.setSelectedItem(index, false);
				this.useSelectedItem(e);
			});

			el.addEventListener("mousemove", () => this.setSelectedItem(index, false));

			this.suggestionsContainer.appendChild(el);
			this.suggestionEls.push(el);
		});

		this.setSelectedItem(0, false);
	}

	private setSelectedItem(index: number, scroll = false) {
		this.suggestionEls[this.selectedItem]?.classList.remove("is-selected");
		this.selectedItem = (index + this.suggestionEls.length) % this.suggestionEls.length;
		this.suggestionEls[this.selectedItem]?.classList.add("is-selected");
		if (scroll) this.suggestionEls[this.selectedItem]?.scrollIntoView(false);
	}

	private useSelectedItem(event: MouseEvent | KeyboardEvent) {
		const item = this.suggestions[this.selectedItem];
		if (item) this.selectSuggestion(item, event);
		this.close();
	}

	private open(): void {
		(this.app as unknown as { keymap: { pushScope(scope: Scope): void } }).keymap.pushScope(this.scope);
		document.body.appendChild(this.suggestEl);

		this.popper = createPopper(this.inputEl, this.suggestEl, {
			placement: "bottom-start",
			modifiers: [
				{
					name: "sameWidth",
					enabled: true,
					fn: ({ state, instance }) => {
						const width = `${state.rects.reference.width}px`;
						if (state.styles.popper.width === width) return;
						state.styles.popper.width = width;
						instance.update();
					},
					phase: "beforeWrite",
					requires: ["computeStyles"],
				},
			],
		});
	}

	private close(): void {
		(this.app as unknown as { keymap: { popScope(scope: Scope): void } }).keymap.popScope(this.scope);
		this.suggestions = [];
		while (this.suggestionsContainer.firstChild) {
			this.suggestionsContainer.removeChild(this.suggestionsContainer.firstChild);
		}
		this.popper?.destroy();
		this.suggestEl.remove();
	}

	abstract getSuggestions(inputStr: string): T[];
	abstract renderSuggestion(item: T, el: HTMLElement): void;
	abstract selectSuggestion(item: T, evt: MouseEvent | KeyboardEvent): void;
}

class FolderSuggest extends TextInputSuggest<TFolder> {
	getSuggestions(inputStr: string): TFolder[] {
		const lower = inputStr.toLowerCase();
		return this.app.vault.getAllLoadedFiles()
			.filter((f): f is TFolder => f instanceof TFolder && f.path.toLowerCase().includes(lower));
	}

	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.textContent = folder.path;
	}

	selectSuggestion(folder: TFolder): void {
		this.inputEl.value = folder.path;
		this.inputEl.dispatchEvent(new Event("input"));
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
		.setName("Vault Folder Path")
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

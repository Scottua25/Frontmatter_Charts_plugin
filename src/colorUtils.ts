import { Setting } from "obsidian";

export function parseRGBA(str: string): [number, number, number, number] {
	const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)?\)/);
	if (match) {
		const [, r, g, b, a] = match;
		return [
			parseInt(r), parseInt(g), parseInt(b),
			a !== undefined && a !== "" ? parseFloat(a) : 1
		];
	}
	return [0, 0, 0, 1];
}

export function rgbToHex(r: number, g: number, b: number): string {
	return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

export function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace("#", "");
	const bigint = parseInt(h, 16);
	return [
		(bigint >> 16) & 255,
		(bigint >> 8) & 255,
		bigint & 255,
	];
}

export function addColorWithAlphaSetting(
	block: HTMLElement,
	label: string,
	description: string,
	initial: string,
	onChange: (rgba: string) => Promise<void>
) {
	const setting = new Setting(block)
		.setName(label)
		.setDesc(description);

	const wrapper = setting.controlEl.createDiv({ cls: "rgba-input-wrapper" });

	let [r, g, b, a] = parseRGBA(initial);

	const colorInput = document.createElement("input");
	colorInput.type = "color";
	colorInput.value = rgbToHex(r, g, b);
	colorInput.style.marginRight = "0.5em";
	wrapper.appendChild(colorInput);

	const alphaInput = document.createElement("input");
	alphaInput.type = "range";
	alphaInput.min = "0";
	alphaInput.max = "1";
	alphaInput.step = "0.01";
	alphaInput.value = a.toString();
	alphaInput.style.width = "100px";
	wrapper.appendChild(alphaInput);

	const alphaLabel = document.createElement("span");
	alphaLabel.className = "alpha-label";
	alphaLabel.textContent = ` ${Math.round(a * 100)}%`;
	wrapper.appendChild(alphaLabel);

	const update = async () => {
		const rgba = `rgba(${r},${g},${b},${a})`;
		await onChange(rgba);
	};

	colorInput.addEventListener("input", async (e) => {
		const hex = (e.target as HTMLInputElement).value;
		[r, g, b] = hexToRgb(hex);
		await update();
	});

	alphaInput.addEventListener("input", async (e) => {
		a = parseFloat((e.target as HTMLInputElement).value);
		alphaLabel.textContent = ` ${Math.round(a * 100)}%`;
		await update();
	});
}
export function addInlineColorPicker(
	settingEl: HTMLElement,
	initialColor: string,
	onChange: (color: string) => void
): void {
	const colorInput = document.createElement("input");
	colorInput.type = "color";

	// Extract just the base color (#rrggbb) from rgba or hex
	const rgbHex = (() => {
		try {
			if (initialColor.startsWith("rgba")) {
				const [r, g, b] = initialColor.match(/\d+/g)!.map(Number);
				return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
			}
			if (initialColor.startsWith("#")) return initialColor;
		} catch (_) {}
		return "#000000";
	})();

	colorInput.value = rgbHex;
	colorInput.style.marginLeft = "8px";
	colorInput.style.verticalAlign = "middle";
	colorInput.addEventListener("input", () => onChange(colorInput.value));
	settingEl.appendChild(colorInput);
}

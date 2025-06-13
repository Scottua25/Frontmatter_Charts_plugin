import { ToggleComponent, TextComponent } from "obsidian";
import type ChartDashboardPlugin from "../../main";
import { chartRoleDefinitions } from "../chartRoles";

type ChartType = keyof typeof chartRoleDefinitions;

export function createRoleFieldRow(
	field: string,
	chartType: ChartType,
	config: any,
	plugin: ChartDashboardPlugin,
	forceRerender?: () => void
): HTMLElement {
	const row = document.createElement("div");
	row.classList.add("role-field-row");
	row.dataset.field = field;

	const roleDef = chartRoleDefinitions[chartType];
	const roleKeys = Object.keys(roleDef.roles);
	const roleAssignments: Record<string, string[]> = {};

	roleKeys.forEach(roleKey => {
		const current = config[roleKey];
		if (Array.isArray(current)) roleAssignments[roleKey] = [...current];
		else if (typeof current === "string") roleAssignments[roleKey] = [current];
		else roleAssignments[roleKey] = [];
	});

	// Toggle
	const toggle = new ToggleComponent(row);
	toggle.setValue(config.fields?.[field]?.enabled ?? false);
	toggle.onChange(async (val) => {
		config.fields ??= {};
		config.fields[field] ??= {};
		config.fields[field].enabled = val;
		await plugin.saveSettings();
	});

	// Label
	const label = document.createElement("span");
	label.textContent = " " + field;
	label.classList.add("role-field-label");
	row.appendChild(label);

	// Role assignments
	for (const roleKey of roleKeys) {
		const meta = (roleDef.roles as Record<string, { label: string; single: boolean }>)[roleKey];
		const box = document.createElement("input");
		box.type = meta.single ? "radio" : "checkbox";
		box.name = meta.single ? `role-${roleKey}` : `${field}-role-${roleKey}`;
		box.checked = roleAssignments[roleKey].includes(field);

		box.addEventListener("change", async (e) => {
			const isChecked = (e.target as HTMLInputElement).checked;
			if (!config[roleKey]) config[roleKey] = meta.single ? "" : [];

			if (meta.single) {
				config[roleKey] = field;
			} else {
				const list = config[roleKey] as string[];
				if (isChecked) {
					if (!list.includes(field)) list.push(field);
				} else {
					config[roleKey] = list.filter(f => f !== field);
				}
			}

			await plugin.saveSettings();

			// Always rerender on change to show/hide target/color
			if (forceRerender) {
				const oldRow = row.parentElement?.querySelector(`[data-field="${field}"]`);
				const newRow = createRoleFieldRow(field, chartType, config, plugin, forceRerender);
				if (oldRow && newRow) oldRow.replaceWith(newRow);
			}
		});

		const labelEl = document.createElement("label");
		labelEl.appendChild(box);
		labelEl.append(" " + roleKey);
		row.appendChild(labelEl);
	}

	// === Pre-populate target if already assigned and allowed
	if ("allowTarget" in roleDef && roleDef.allowTarget) {
		const shouldShowTarget =
			["z", "value", "size"].some(roleKey =>
				Array.isArray(config[roleKey])
					? config[roleKey].includes(field)
					: config[roleKey] === field
			);

		if (shouldShowTarget) {
			const targetInput = new TextComponent(row);
			targetInput.inputEl.classList.add("target");
			targetInput.setPlaceholder("Target");

			const targetValue = config.fields?.[field]?.target;
			targetInput.setValue(targetValue != null ? String(targetValue) : "");

			targetInput.onChange(async (val) => {
				config.fields ??= {};
				config.fields[field] ??= {};
				const num = Number(val);
				if (!isNaN(num)) {
					config.fields[field].target = num;
				} else {
					delete config.fields[field].target;
				}
				await plugin.saveSettings();
			});

			row.appendChild(targetInput.inputEl);
		}
	}

	// === Pre-populate color picker if assigned to y-axis in bar/line
	if (["bar", "line"].includes(chartType)) {
		const isYAxis =
			Array.isArray(config.y) ? config.y.includes(field) : config.y === field;

		const isEnabled = config.fields?.[field]?.enabled;
		if (isEnabled && isYAxis) {
			const colorInput = document.createElement("input");
			colorInput.type = "color";
			colorInput.classList.add("property-color-picker");

			colorInput.value = config.fields?.[field]?.color || "#ff9900";

			colorInput.addEventListener("input", async (e) => {
				const newColor = (e.target as HTMLInputElement).value;
				config.fields ??= {};
				config.fields[field] ??= {};
				config.fields[field].color = newColor;
				await plugin.saveSettings();
			});

			row.appendChild(colorInput);
		}
	}

	return row;
}

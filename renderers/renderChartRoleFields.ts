
import { ToggleComponent, TextComponent } from "obsidian";
import { chartRoleDefinitions } from "../src/chartRoles";

/**
 * Renders a list of detected YAML fields and allows assigning them to roles
 * such as x, y, z, size, etc. depending on chart type.
 */
export function renderChartRoleFields(
	container: HTMLElement,
	chartType: string,
	config: any,
	availableFields: string[],
	plugin: { saveSettings: () => Promise<void> },
    forceRerender?: () => void
): void {

	// Clear previous render
	while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    

	const roleDef = chartRoleDefinitions[chartType as keyof typeof chartRoleDefinitions];
	if (!roleDef || !roleDef.roles) return;

	const roleKeys = Object.keys(roleDef.roles);
	const roleAssignments: Record<string, string[]> = {};

	// Initialize role assignments from config
	roleKeys.forEach(roleKey => {
		const current = config[roleKey];
		if (Array.isArray(current)) {
			roleAssignments[roleKey] = [...current];
		} else if (typeof current === "string") {
			roleAssignments[roleKey] = [current];
		} else {
			roleAssignments[roleKey] = [];
		}
	});

	availableFields.forEach(field => {
		const row = container.createDiv({ cls: "role-field-row" });

		// Enable toggle
		const enabledToggle = new ToggleComponent(row);
		enabledToggle.setValue(config.fields?.[field]?.enabled ?? false);
		enabledToggle.onChange(async (val) => {
			if (!config.fields) config.fields = {};
			if (!config.fields[field]) config.fields[field] = {};
			config.fields[field].enabled = val;
			await plugin.saveSettings();
		});

		// Label
		const span = document.createElement("span");
        span.textContent = " " + field;
        span.classList.add("role-field-label");
        row.appendChild(span);

		// Role selectors
		roleKeys.forEach(roleKey => {
            const roleMeta = (roleDef.roles as Record<string, { label: string; single: boolean }>)[roleKey];
			const box = document.createElement("input");
			box.type = roleMeta.single ? "radio" : "checkbox";
			box.name = roleMeta.single ? `role-${roleKey}` : `${field}-role-${roleKey}`;
			box.checked = roleAssignments[roleKey].includes(field);
            box.id = `role-${roleKey}-${field}`;

            box.addEventListener("change", async (event: Event) => {
                if (!event?.target) return;
                const isChecked = (event.target as HTMLInputElement).checked;
            
                // Ensure config field exists
                if (!config[roleKey]) config[roleKey] = roleMeta.single ? "" : [];
            
                if (roleMeta.single) {
                    config[roleKey] = field;
                } else {
                    const list = config[roleKey] as string[];
                    if (isChecked) {
                        if (!list.includes(field)) list.push(field);
                    } else {
                        config[roleKey] = list.filter(f => f !== field);
                    }
                }
            
                if (["z", "value", "size"].includes(roleKey)) {
                    // Check if this row already has an input
                    let existingInput = row.querySelector("input[type='text']") as HTMLInputElement;
                    if (isChecked) {
                        if (!existingInput) {
                            const input = new TextComponent(row);
                            input.inputEl.classList.add("role-field-target");
                            input.setPlaceholder("Target");
                            input.setValue(config.fields?.[field]?.target?.toString() || "");
                            input.onChange(async (val) => {
                                if (!config.fields) config.fields = {};
                                if (!config.fields[field]) config.fields[field] = {};
                                const num = Number(val);
                                if (!isNaN(num)) config.fields[field].target = num;
                                else delete config.fields[field].target;
                                await plugin.saveSettings();
                            });
                        }
                    } else {
                        if (existingInput) existingInput.remove();
                    }
                }
                
                await plugin.saveSettings();

                // Only re-render if needed
                if (["y", "z", "value", "size"].includes(roleKey)) {
                    const activeId = (document.activeElement as HTMLElement)?.id;

                    forceRerender?.();

                    // After DOM is updated, restore focus
                    requestAnimationFrame(() => {
                        if (activeId) {
                            const el = document.getElementById(activeId);
                            if (el) el.focus();
                        }
                    });
                }

            });
                  
			const label = document.createElement("label");
			label.appendChild(box);
			label.append(" " + roleKey);
			row.appendChild(label);
		});

                // Conditionally show a color picker if the field is a Y-axis field and we're in a line chart
                if ((chartType === "line" || chartType === "bar") && roleAssignments["y"].includes(field)) {
            const colorInput = document.createElement("input");
            colorInput.type = "color";
            colorInput.value = config.fields?.[field]?.color || "#ff9900";
            colorInput.classList.add("color-chart-picker")
            colorInput.title = "Line/marker color";

            colorInput.addEventListener("input", async (e) => {
                const val = (e.target as HTMLInputElement).value;
                if (!config.fields) config.fields = {};
                if (!config.fields[field]) config.fields[field] = {};
                config.fields[field].color = val;
                await plugin.saveSettings();
            });

            row.appendChild(colorInput);
        }

        const wasAssignedToZ = roleAssignments["z"]?.includes(field);
            if (wasAssignedToZ) {
                const input = new TextComponent(row);
                input.inputEl.classList.add("role-field-target");
                input.setPlaceholder("Target");
                input.setValue(config.fields?.[field]?.target?.toString() || "");
                input.onChange(async (val) => {
                    if (!config.fields) config.fields = {};
                    if (!config.fields[field]) config.fields[field] = {};
                    const num = Number(val);
                    if (!isNaN(num)) config.fields[field].target = num;
                    else delete config.fields[field].target;
                    await plugin.saveSettings();
                });
            }
	});
}
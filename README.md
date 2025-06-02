# Heatmap Dashboard Plugin for Obsidian

This plugin visualizes your YAML frontmatter data as dynamic heatmaps — perfect for tracking nutrition, habits, symptoms, and more directly inside your notes.

## ✨ Features

- 📊 **Per-note YAML field scanning** — automatically detects frontmatter fields in a selected folder.
- 🗂️ **Multiple heatmap types** — define as many heatmaps as you want, each with its own folder, fields, and layout.
- 🎨 **Visual customization** — choose Plotly colorscales, reverse the gradient, set font size/color, margins, and background.
- 📆 **Limit date range** — restrict each heatmap to show only recent days.
- ✅ **RDA-based value scaling** — shows percent of daily recommended value per nutrient (or other metric).
- ❌ **Over-limit cell markers** — optionally show an “X” in cells exceeding 100%.
- 🔍 **Collapsible field settings** — toggle detailed frontmatter field config with RDA inputs.
- 💾 **Persistent settings** — plugin settings survive restarts and reloads.

## 📦 Installation

1. Clone this repo or download the latest release.
2. Copy `main.js`, `manifest.json`, and `styles.css` into:
   ```
   <your-vault>/.obsidian/plugins/heatmap-dashboard/
   ```
3. Enable the plugin in Obsidian's settings under **Community Plugins**.

## ⚙️ How to Use

1. Open the plugin settings.
2. Click **"Add New Heatmap Type"** and give it a name (e.g., `micros`, `workouts`, etc.).
3. Set the folder to scan.
4. Click **Scan** to detect YAML fields.
5. Enable fields and input their target/RDA values (for % calculations).
6. Use the code block in any note:
   \`\`\`your-heatmap-name
   \`\`\`
7. Voilà — a live heatmap chart rendered using Plotly!

## 🧪 Examples

### Example frontmatter

```yaml
---
date: 2025-06-01
iron_mg: 6
magnesium_mg: 300
zinc_mg: 10
---
```

### Example chart embed

````markdown
```micros
```
````

## 🛠️ Developer Notes

Built with:
- TypeScript
- Obsidian plugin API
- Plotly.js for rendering

This project originated from the [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) and was extensively expanded to support advanced data visualization use cases inside Obsidian.

## 📚 Roadmap

### Near-Term Improvements
- [ ] Add "X" markers for over-RDA values (visual flagging)
- [ ] Toggle to display raw values instead of % of RDA
- [ ] Improved error reporting if folder or frontmatter is invalid
- [ ] Custom sorting for Y-axis fields

### Stretch Goals
- [ ] Support for heatmap export to PNG/SVG
- [ ] Toggle between weekly/monthly aggregations
- [ ] Hover tooltips with field + exact value
- [ ] Inline chart preview when editing notes
- [ ] Theme-aware color presets (light/dark mode auto-switch)

## ❤️ Support

If this plugin helps improve your Obsidian workflow, consider showing support:

[Buy Me a Coffee ☕](https://buymeacoffee.com)

---

> Built by someone who'd rather see their data in heatmaps than spreadsheets.

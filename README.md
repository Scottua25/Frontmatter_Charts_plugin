# Frontmatter Charts Plugin for Obsidian

This plugin visualizes your YAML frontmatter data as dynamic charts — perfect for tracking nutrition, habits, symptoms, and more directly inside your notes.

## ✨ Features

- 📊 **Per-note YAML field scanning** — automatically detects frontmatter fields in a selected folder.
- 🗂️ **Multiple chart types** — define as many charts as you want, each with its own folder, fields, and layout.

- 🎨 **Visual customization** — choose Plotly colorscales, reverse the gradient, set font size/color, margins, and background.
- 📆 **Limit date range** — restrict each chart to show only recent days.
- ✅ **Target-based value scaling** — shows percent of target value per yaml property.
- ❌ **Over-limit cell markers** — optionally show an “X” in cells exceeding 100%.
- 🔍 **Collapsible field settings** — toggle detailed frontmatter field config with target inputs.
- 💾 **Persistent settings** — plugin settings survive restarts and reloads.
- 📱 **Responsive layout** — chart configuration UI adjusts for smaller screens.

### 📈 Supported Chart Types

- `heatmap` — great for time-based tracking (e.g., micronutrients, symptoms)
- `bar` — compare values side-by-side
- `line` — show trends over time
- `pie` — visualize proportions for a single note
- `indicator` — (coming soon) KPI-style single-value visualizations

### 🎨 Chart Customization Options

Each chart allows you to customize:

- Chart type (heatmap, bar, line, pie, indicator)
- Colorscale (with preview bar)
- Reverse gradient toggle
- Value scaling and target thresholds
- Background color
- Font size and color
- Margins (top, bottom, left, right)


## 📦 Installation

1. Clone this repo or download the latest release.
2. Copy `main.js`, `manifest.json`, and `styles.css` into:

    ````markdown
    <your-vault>/.obsidian/plugins/frontmatter-charts/
    ````

3. Enable the plugin in Obsidian's settings under **Community Plugins**. (Coming Soon!)

## ⚙️ How to Use

  
1. Open the plugin settings.
2. Enter a name for your chart (e.g., `micros`, `workouts`, etc.) and click the "Add" button.
3. Set the folder to scan.
4. Click **Scan** to detect YAML fields.
5. Enable fields and input their target values (for % calculations) if using heatmap as a chart type.
6. Use the code block in any note:
    ````markdown
    ```insert-chart
        <name from step 2>
    ```
    ````
7. Voilà — a live chart rendered using Plotly!
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

```insert-chart
   macros
```

````
## 🛠️ Developer Notes

Built with:

- TypeScript
- Obsidian plugin API
- Plotly.js for rendering

This project originated from the [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) and was extensively expanded to support advanced data visualization use cases inside Obsidian.
## ❤️ Support

![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)

If this plugin helps improve your Obsidian workflow, consider showing support:

[Buy Me a Coffee ☕](https://buymeacoffee.com/scottua)

---

> Built by someone who'd rather see their data in charts than spreadsheets.
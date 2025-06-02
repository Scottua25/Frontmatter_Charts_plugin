export const DEFAULT_SETTINGS = {
    heatmapTypes: {
        "micronutrient-heatmap": {
            fields: [
                "magnesium_mg", "potassium_mg", "sodium_mg", "calcium_mg",
                "iron_mg", "zinc_mg", "vitamin_d_mcg", "vitamin_b12_mcg",
                "choline_mg", "phosphorus_mg", "vitamin_a_mcg",
                "iodine_mcg", "selenium_mcg", "chloride_mg"
            ]
        },
        "macronutrient-heatmap": {
            fields: ["calories_kcal", "protein_g", "carbs_g", "fat_g", "caffeine_mg", "alcohol_mg"]
        }
    },
    maxRDA: 120,
    limitDays: 0,
    gridSize: 20,
    opacity: 0.8
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFhQSxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBb0I7SUFDaEQsWUFBWSxFQUFFO1FBQ2IsdUJBQXVCLEVBQUU7WUFDeEIsTUFBTSxFQUFFO2dCQUNQLGNBQWMsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLFlBQVk7Z0JBQ3pELFNBQVMsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLGlCQUFpQjtnQkFDeEQsWUFBWSxFQUFFLGVBQWUsRUFBRSxlQUFlO2dCQUM5QyxZQUFZLEVBQUUsY0FBYyxFQUFFLGFBQWE7YUFDM0M7U0FDRDtRQUNELHVCQUF1QixFQUFFO1lBQ3hCLE1BQU0sRUFBRSxDQUFDLGVBQWUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsWUFBWSxDQUFDO1NBQ3ZGO0tBQ0Q7SUFDRCxNQUFNLEVBQUUsR0FBRztJQUNYLFNBQVMsRUFBRSxDQUFDO0lBQ1osUUFBUSxFQUFFLEVBQUU7SUFDWixPQUFPLEVBQUUsR0FBRztDQUNaLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIEhlYXRtYXBUeXBlQ29uZmlnIHtcclxuXHRmaWVsZHM6IHN0cmluZ1tdO1xyXG5cdHJkYT86IFJlY29yZDxzdHJpbmcsIG51bWJlcj47IC8vIG9wdGlvbmFsIG92ZXJyaWRlXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSGVhdG1hcFNldHRpbmdzIHtcclxuXHRoZWF0bWFwVHlwZXM6IFJlY29yZDxzdHJpbmcsIEhlYXRtYXBUeXBlQ29uZmlnPjtcclxuXHRncmlkU2l6ZTogbnVtYmVyO1xyXG5cdG9wYWNpdHk6IG51bWJlcjtcclxuXHRtYXhSREE6IG51bWJlcjtcclxuXHRsaW1pdERheXM6IG51bWJlcjtcclxuICB9ICBcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBIZWF0bWFwU2V0dGluZ3MgPSB7XHJcblx0aGVhdG1hcFR5cGVzOiB7XHJcblx0XHRcIm1pY3JvbnV0cmllbnQtaGVhdG1hcFwiOiB7XHJcblx0XHRcdGZpZWxkczogW1xyXG5cdFx0XHRcdFwibWFnbmVzaXVtX21nXCIsIFwicG90YXNzaXVtX21nXCIsIFwic29kaXVtX21nXCIsIFwiY2FsY2l1bV9tZ1wiLFxyXG5cdFx0XHRcdFwiaXJvbl9tZ1wiLCBcInppbmNfbWdcIiwgXCJ2aXRhbWluX2RfbWNnXCIsIFwidml0YW1pbl9iMTJfbWNnXCIsXHJcblx0XHRcdFx0XCJjaG9saW5lX21nXCIsIFwicGhvc3Bob3J1c19tZ1wiLCBcInZpdGFtaW5fYV9tY2dcIixcclxuXHRcdFx0XHRcImlvZGluZV9tY2dcIiwgXCJzZWxlbml1bV9tY2dcIiwgXCJjaGxvcmlkZV9tZ1wiXHJcblx0XHRcdF1cclxuXHRcdH0sXHJcblx0XHRcIm1hY3JvbnV0cmllbnQtaGVhdG1hcFwiOiB7XHJcblx0XHRcdGZpZWxkczogW1wiY2Fsb3JpZXNfa2NhbFwiLCBcInByb3RlaW5fZ1wiLCBcImNhcmJzX2dcIiwgXCJmYXRfZ1wiLCBcImNhZmZlaW5lX21nXCIsIFwiYWxjb2hvbF9tZ1wiXVxyXG5cdFx0fVxyXG5cdH0sXHJcblx0bWF4UkRBOiAxMjAsXHJcblx0bGltaXREYXlzOiAwLFxyXG5cdGdyaWRTaXplOiAyMCxcclxuXHRvcGFjaXR5OiAwLjhcclxufTtcclxuIl19
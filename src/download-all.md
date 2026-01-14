# Create New Dataset with Township Features

```js
const ps = FileAttachment("data/og-policestops.csv").csv({typed:true})
```

## Original Locations

```js
d3.group(
  ps,
  d => d.original_location
)
```

## Township Locations

Mapped locations by townships, since we have access to Township geojson shape/boundaries. See townships.geojson, which I located at [https://data-wake.opendata.arcgis.com/](https://data-wake.opendata.arcgis.com/datasets/748df1a75ee7448e80f6ae646efa1d79_0/explore?location=35.796482%2C-78.623081%2C9.76).

```js
d3.group(
  ps,
  d => d.township_name
)
```

## Download new data

```js
const downloadAsCSV = (value, name = "untitled", label = "Save") => {
  const a = document.createElement("a")
  const b = a.appendChild(document.createElement("button"))
  b.textContent = label
  a.download = name

  async function reset() {
    await new Promise(requestAnimationFrame);
    URL.revokeObjectURL(a.href)
    a.removeAttribute("href")
    b.textContent = label
    b.disabled = false
  }

  a.onclick = async (event) => {
    b.disabled = true
    if (a.href) return reset() // Already saved.
    b.textContent = "Saving…"
    try {
      const object = await (typeof value === "function" ? value() : value)
      const blob = new Blob([object], { type: "application/octet-stream" })
      b.textContent = "Download"
      a.href = URL.createObjectURL(blob) // eslint-disable-line require-atomic-updates
      if (event.eventPhase) return reset() // Already downloaded.
      a.click() // Trigger the download
    } catch (error) {
      console.error("Download error:", error)
      b.textContent = label
    }
    b.disabled = false
  }

  return a
}
```

Output as new dataset called `policestops-with-townships.csv`.

```js
view(downloadAsCSV(async () => {
  const csvFullString = d3.csvFormat(ps);
  return new Blob([csvFullString], { type: "text/csv" });
}, "policestops-with-townships.csv", "Save Full Data Set As CSV"));
```


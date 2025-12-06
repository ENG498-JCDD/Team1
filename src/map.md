## Distribution of Traffic Stops Across Wake County Townships (2011-2015)

```js
const townships = FileAttachment("data/townships.geojson").json()
```

```js
const raleighStops = FileAttachment("data/policestops-with-townships.csv").csv({typed: true})
```

```js
// Count stops by township ID
const stopsByTownship = d3.rollups(
  raleighStops,
  v => v.length,
  d => d.township_id
)
```

```js
const townshipsWithCounts = {
  type: "FeatureCollection",
  features: townships.features.map(township => {
    // Match on properties.TOWNSHIP (1-20)
    const matchingCount = stopsByTownship.find(d => d[0] === township.properties.TOWNSHIP)
    
    return {
      ...township,
      properties: {
        ...township.properties,
        stopCount: matchingCount ? matchingCount[1] : 0
      }
    }
  })
}
```


```js
Plot.plot({
  projection: {
    type: "conic-conformal",
    rotate: [79, 0],
    domain: townshipsWithCounts,
  },
  color: {
    scheme: "warm",
    legend: true,
    label: "Number of Traffic Stops"
  },
  marks: [
    Plot.geo(townshipsWithCounts, {
      fill: d => d.properties.stopCount,
      stroke: "white",
      strokeWidth: 1,
      tip: true,
      title: d => `${d.properties.NAME}: ${d.properties.stopCount.toLocaleString()} stops`
    })
  ],
  margin: 50,
  height: 600,
  width: 800
})
```


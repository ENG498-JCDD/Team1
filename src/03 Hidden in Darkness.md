```js
import {oneLevelRollUpFlatMap,twoLevelRollUpFlatMap,threeLevelRollUpFlatMap,getUniquePropListBy,mapDateObjectForStops} from "./utils/utilsH1.js"
```


```js
// Load the data
const raleighStops = FileAttachment("./data/policestops-with-townships.csv").csv({typed: true})
```

```js
const stopsWithDateTime = []

for (const stop of raleighStops) {
  const dateObject = new Date(stop.datetime)
  
  stopsWithDateTime.push({
    id: stop.id,
    datetime: stop.datetime,
    race: stop.race,
    sex: stop.sex,
    search_conducted: stop.search_conducted,
    year: dateObject.getFullYear(),
    month: dateObject.getMonth() + 1,  // 1-12
    hour: dateObject.getHours(),  // 0-23
    minute: dateObject.getMinutes()  // 0-59
  })
}
```

```js
for (const stop of stopsWithDateTime) {
  let daylight
  
  // Peak summer (June-July): Daylight until 9pm
  if (stop.month == 6 || stop.month == 7) {
    daylight = stop.hour < 21
  }
  // Early/late summer (May, August): Daylight until 8pm
  else if (stop.month == 5 || stop.month == 8) {
    daylight = stop.hour < 20
  }
  // Winter (Nov-Feb): Dark by 6pm
  else if (stop.month == 11 || stop.month == 12 || stop.month == 1 || stop.month == 2) {
    daylight = stop.hour < 18
  }
  // Spring/Fall (Mar-Apr, Sep-Oct): 7pm cutoff
  else {
    daylight = stop.hour < 19
  }
  
  // Add the light condition field
  if (daylight == true) {
    stop.light_condition = "Daylight"
  } else {
    stop.light_condition = "Darkness"
  }
}
```

```js
// Add twilight period flag to each stop
for (const stop of stopsWithDateTime) {
  if (stop.hour >= 18 && stop.hour <= 21) {
    stop.twilight_period = true
  } else {
    stop.twilight_period = false
  }
}
```

## Overview of Traffic Stop Patterns:

This visualization shows the overall pattern of traffic stops accross all racial groups throughout a 24 hour period.

```js
// Group ALL stops by hour and race
const overviewStopsByHourRace = twoLevelRollUpFlatMap(
  stopsWithDateTime,
  "hour",
  "race",
  "count"
)

// Sort by hour
const overviewStopsByHourRaceSorted = overviewStopsByHourRace.slice().sort((a, b) => a.hour - b.hour)
```

```js
Plot.plot({
  title: "Traffic Stop Patterns by Hour and Race (All Data)",
  width: 1000,
  height: 500,
  marginLeft: 80,
  marginBottom: 80,
  marginTop: 40,
  marginRight: 150,
  grid: true,
  
  x: {
    label: "Hour of Day",
    domain: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
  },
  
  y: {
    label: "Absolute Frequency (Number of Stops)",
    grid: true
  },
  
  color: {
    legend: true,
    domain: ["black", "white", "hispanic", "asian/pacific islander", "other"],
    range: ["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728", "#9467bd"]
  },
  
  marks: [
    Plot.ruleY([0]),
    
    Plot.lineY(
      overviewStopsByHourRaceSorted,
      {
        x: "hour",
        y: "count",
        stroke: "race",
        strokeWidth: 2.5,
        tip: true,
        title: d => `${d.race}: ${d.count} stops at hour ${d.hour}`
      }
    )
  ]
})
```

## Seasonal Variation by Hour for the Veil of Darkness Theory

```js
// Filter to Black drivers in winter OR summer months, and adding season field
const stopsBlackWinterSummer = []
for (const stop of stopsWithDateTime) {
  if (stop.race == "black") {
    // Peak winter: Dec, Jan, Feb (months 12, 1, 2)
    if (stop.month == 12 || stop.month == 1 || stop.month == 2) {
      stop.season = "Winter"
      stopsBlackWinterSummer.push(stop)
    }
    // Peak summer: June, July, Aug (months 6, 7, 8)
    else if (stop.month == 6 || stop.month == 7 || stop.month == 8) {
      stop.season = "Summer"
      stopsBlackWinterSummer.push(stop)
    }
  }
}
```

```js
// 2-level rollup: hour > season 
const stopsByHourSeason = twoLevelRollUpFlatMap(
  stopsBlackWinterSummer,
  "hour",
  "season",
  "count"
)
```

```js
// Winter line (season "Winter", hours 16-23)
const winterEvening = stopsByHourSeason.filter(
  (d) => {
    if (d.season == "Winter" && d.hour >= 16 && d.hour <= 23) {
      return true
    }
  }
)

// Summer line (season "Summer", hours 16-23)
const summerEvening = stopsByHourSeason.filter(
  (d) => {
    if (d.season == "Summer" && d.hour >= 16 && d.hour <= 23) {
      return true
    }
  }
)
```

```js
// Sort by hour
const winterEveningSorted = winterEvening.slice().sort((a, b) => a.hour - b.hour)
const summerEveningSorted = summerEvening.slice().sort((a, b) => a.hour - b.hour)
```

```js
// Calculating percentages for Winter
for (const row of winterEveningSorted) {
  const winterTotal = d3.sum(winterEveningSorted, d => d.count)
  row.percentage = row.count / winterTotal
}

// Calculating percentages for Summer
for (const row of summerEveningSorted) {
  const summerTotal = d3.sum(summerEveningSorted, d => d.count)
  row.percentage = row.count / summerTotal
}
```

```js
// Combining both arrays into one using for loops
const combinedSeasons = []

for (const row of summerEveningSorted) {
  combinedSeasons.push(row)
}

for (const row of winterEveningSorted) {
  combinedSeasons.push(row)
}
```

```js
Plot.plot({
  title: "Black Driver Stops: Winter vs Summer (2011-2015)",
  width: 1000,
  height: 500,
  marginLeft: 80,
  marginBottom: 40,
  marginTop: 40,
  marginRight: 150,
  grid: true,
  x: {
    label: "Hour of Day",
    domain: [16, 17, 18, 19, 20, 21, 22, 23]
  },
  y: {
    label: "Percentage",
    percent: true
  },
  color: {
    legend: true,
    domain: ["Summer", "Winter"],
    range: ["blue", "red"]
  },
  marks: [
    Plot.ruleY([0]),
    Plot.lineY(
      combinedSeasons,
      {
        x: "hour",
        y: "percentage",
        stroke: "season",
        strokeWidth: 2.5,
        tip: true,
      }
    ),
  ]
})
```

## Traffic Stops per Hour Statistics (Black & White Drivers)
```js
// Group stops by hour > race > light_condition
const stopsByHourRaceLight = threeLevelRollUpFlatMap(
  stopsWithDateTime,
  "hour",
  "race",
  "light_condition",
  "count"
)
```
```js
// Calculate TOTAL stops for Black and White only (grand total)
const grandTotal = d3.sum(
  stopsByHourRaceLight,
  (d) => {
    if (d.race == "black" || d.race == "white") {
      return d.count
    }
  }
)

// Calculate percentages as % of grand total
const blackWhiteOnly = []
for (const row of stopsByHourRaceLight) {
  // Only include Black and White
  if (row.race == "black" || row.race == "white") {
    blackWhiteOnly.push({
      hour: row.hour,
      race: row.race,
      light_condition: row.light_condition,
      count: row.count,
      percentage: row.count / grandTotal
    })
  }
}
```
```js
// Create array of all percentages for Black and White
const stopPercentages = blackWhiteOnly.map(
  (d) => {
    if (isNaN(d.percentage) == false) {
      return d.percentage
    }
    else {
      return 0
    }
  }
)
```

#### Location
- **Average mean**: ${(d3.mean(blackWhiteOnly, d => d.percentage) * 100).toFixed(2)}%
- **Median**: ${(d3.median(blackWhiteOnly, d => d.percentage) * 100).toFixed(2)}%
- **Mode**: ${(d3.mode(blackWhiteOnly, d => d.percentage) * 100).toFixed(2)}%

#### Spread
**Range**: ${d3.min(blackWhiteOnly, d => d.percentage)} to ${d3.max(blackWhiteOnly, d => d.percentage)}, (or ${(d3.min(blackWhiteOnly, d => d.percentage)*100).toFixed(2)}% to ${(d3.max(blackWhiteOnly, d => d.percentage)*100).toFixed(2)}%).

**Variance of traffic stops**: ${d3.variance(stopPercentages).toFixed(10)}

**Standard deviation of traffic stops**: On average, all traffic stops per hour deviate from the mean by <strong>${(100 * d3.deviation(stopPercentages)).toFixed(2)}%</strong>.
```js
Plot.plot({
  title: "Traffic Stop Distribution by Hour, Race, and Light Condition",
  width: 1000,
  height: 500,
  marginLeft: 80,
  marginBottom: 80,
  marginTop: 60,
  marginRight: 150,
  grid: true,
  
  x: {
    label: "Hour of Day",
    domain: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
  },
  
  y: {
    label: "Percentage",
    percent: true
  },
  
  color: {
    legend: true,
    domain: ["black", "white"],
    range: ["#ff7f0e", "#1f77b4"]
  },
  
  marks: [
    Plot.ruleY([0]),
    
    // Mean line
    Plot.ruleY([d3.mean(blackWhiteOnly, d => d.percentage)], {
      stroke: "gray",
      strokeWidth: 2,
      strokeDasharray: "4,4"
    }),
    
    // Dots for each data point
    Plot.dot(
      blackWhiteOnly,
      {
        x: "hour",
        y: "percentage",
        fill: d => d.race == "black" ? "#ff7f0e" : "#1f77b4",
        r: 5,
        tip: true,
        title: d => `Hour ${d.hour}, ${d.race}, ${d.light_condition}: ${(d.percentage * 100).toFixed(2)}%`
      }
    )
  ]
})
```



























<!-- ## Traffic Stops per Hour Statistics (Black & White Drivers)


```js
import {rollups} from "npm:d3-array";

// Do the rollup manually to see the nested structure
const rawRollup = rollups(
  stopsWithDateTime,
  (v) => v.length,
  d => d.hour,
  d => d.race,
  d => d.light_condition
)
```

```js
// Look at ONE hour's data structure
// Find hour 20 specifically (we know it should have both daylight and darkness)
const hour20Data = rawRollup.find(d => d[0] === 20)
```
```js
// Expand it to see the nested structure
hour20Data
```



```js
const stopsByHourRaceLight = threeLevelRollUpFlatMap(
  stopsWithDateTime,
  "hour",
  "race",
  "light_condition",
  "count"
)
```

```js
// Check if it worked
stopsByHourRaceLight.slice(0, 3).map(d => ({
  hour: d.hour,
  race: d.race,
  light_condition: d.light_condition,
  count: d.count
}))
```



```js
const grandTotal = d3.sum(
  stopsByHourRaceLight,
  (d) => {
    if (d.race === "black" || d.race === "white") {
      return d.count
    }
  }
)

const reducedStopsData = []

for (const row of stopsByHourRaceLight) {
  if (row.race === "black" || row.race === "white") {
    reducedStopsData.push({
      hour: row.hour,
      race: row.race,
      light_condition: row.light_condition,
      count: row.count,
      percentage: row.count / grandTotal
    })
  }
}

const blackWhiteOnly = reducedStopsData

const stopPercentages = blackWhiteOnly.map(
  (d) => {
    if (isNaN(d.percentage) === false) {
      return d.percentage
    }
    else {
      return 0
    }
  }
)
```



#### Location
- **Average mean**: ${(d3.mean(blackWhiteOnly, d => d.percentage) * 100).toFixed(2)}%
- **Median**: ${(d3.median(blackWhiteOnly, d => d.percentage) * 100).toFixed(2)}%
- **Mode**: ${(d3.mode(blackWhiteOnly, d => d.percentage) * 100).toFixed(2)}%

#### Spread
- **Range**: ${d3.min(blackWhiteOnly, d => d.percentage)} - ${d3.max(blackWhiteOnly, d => d.percentage)}, (or ${(d3.min(blackWhiteOnly, d => d.percentage)*100).toFixed(2)}% - ${(d3.max(blackWhiteOnly, d => d.percentage)*100).toFixed(2)}%).

**Variance of traffic stops**: ${d3.variance(stopPercentages).toFixed(10)}

**Standard deviation of traffic stops**: On average, all traffic stops per hour deviate from the mean by <strong>${(100 * d3.deviation(stopPercentages)).toFixed(2)}%</strong>.

```js
Plot.plot({
  title: "Traffic Stop Distribution by Hour, Race, and Light Condition",
  width: 1000,
  height: 500,
  marginLeft: 80,
  marginBottom: 80,
  marginTop: 60,
  marginRight: 150,
  grid: true,
  
  x: {
    label: "Hour of Day",
    domain: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
  },
  
  y: {
    label: "Percentage",
    percent: true
  },
  
  color: {
    legend: true,
    domain: ["black", "white"],
    range: ["#ff7f0e", "#1f77b4"]
  },
  
  marks: [
    // Mean line
    Plot.ruleY([d3.mean(blackWhiteOnly, d => d.percentage)], {
      stroke: "gray",
      strokeWidth: 2,
      strokeDasharray: "4,4"
    }),
    
    // Dots for each data point
    Plot.dot(
      blackWhiteOnly,
      {
        x: "hour",
        y: "percentage",
        fill: d => d.race === "black" ? "#ff7f0e" : "#1f77b4",  // Explicit colors!
        r: 5,
        tip: true,
        title: d => `Hour ${d.hour}, ${d.race}, ${d.light_condition}: ${(d.percentage * 100).toFixed(2)}%`
      }
    )
  ]
})
```



```js
// Test the function on a small subset
const testData = stopsWithDateTime.filter(d => d.hour === 20 && d.race === "black")
```

```js
const testRollup = threeLevelRollUpFlatMap(
  testData,
  "hour",
  "race", 
  "light_condition",
  "count"
)
```

```js
// Check the result
testRollup
``` -->
```js
import {oneLevelRollUpFlatMap,twoLevelRollUpFlatMap,threeLevelRollUpFlatMap,getUniquePropListBy,mapDateObjectForStops} from "./utils/utilsH1.js";
```

Step 1: Data Preparation- Extract DateTime Components

```js
// Load the data
const raleighStops = FileAttachment("./data/policestops-with-townships.csv").csv({typed: true})
```

```js
raleighStops
```

```js
// Extract datetime components
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
stopsWithDateTime[0]
```

Step 2: Add Light Condition (Daylight vs Darkness)

Logic:

Summer months (May-August): Daylight until 8pm (hour < 20)
Winter months (Nov-Feb): Dark by 6pm (hour < 18)
Spring/Fall (Mar-Apr, Sep-Oct): Use 7pm (hour < 19)

```js
// Add light condition to each stop
for (const stop of stopsWithDateTime) {
  let daylight
  
  // Summer months (5-8): daylight until 8pm
  if (stop.month >= 5 && stop.month <= 8) {
    daylight = stop.hour < 20
  }
  // Winter months (11-12, 1-2): dark by 6pm
  else if (stop.month === 11 || stop.month === 12 || stop.month === 1 || stop.month === 2) {
    daylight = stop.hour < 18
  }
  // Spring/Fall (3-4, 9-10): use 7pm
  else {
    daylight = stop.hour < 19
  }
  
  // Add the light condition field
  if (daylight === true) {
    stop.light_condition = "Daylight"
  } else {
    stop.light_condition = "Darkness"
  }
}
```

```js
stopsWithDateTime.slice(0, 5)
```

Step 3: Add Twilight Period

Twilight Period: It is a specific time window in the evening where the lighting conditions change depending on the season.

For instance: 
 - 7:00 PM in Jume (summer) -> Still daylight
 - 7:00 PM in December (winter) -> Already dark

The twilight period is approximately 6 pm to 9 pm (hours 18-21). This is where the lighting conditions vary the most by season.

By this we can test the veil of darkness hypothesis.

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
```js
stopsWithDateTime.slice(0, 10)
```

Visualization 1:

step 1:

```js
// Group stops by hour and race
const stopsByHourRace = twoLevelRollUpFlatMap(
  stopsWithDateTime,
  "hour",
  "race",
  "count"
)
```

```js
// Check the output
stopsByHourRace
```

Step 2: Calculate Percentage

```js
// Calculate percentage for each hour
const hourlyPercentages = []

// Loop through hours 0-23
for (let hour = 0; hour < 24; hour = hour + 1) {
  
  // Get all stops for this hour
  const stopsForHour = stopsByHourRace.filter(d => d.hour === hour)
  
  // Find Black and White counts
  let blackCount = 0
  let whiteCount = 0
  
  for (const row of stopsForHour) {
    if (row.race === "black") {
      blackCount = row.count
    }
    if (row.race === "white") {
      whiteCount = row.count
    }
  }
  
  // Calculate total and percentages
  const totalCount = blackCount + whiteCount
  
  if (totalCount > 0) {
    const blackPercentage = (blackCount / totalCount) * 100
    const whitePercentage = (whiteCount / totalCount) * 100
    
    hourlyPercentages.push({
      hour: hour,
      race: "Black",
      percentage: blackPercentage
    })
    
    hourlyPercentages.push({
      hour: hour,
      race: "White",
      percentage: whitePercentage
    })
  }
}
```

```js
// Check the output
hourlyPercentages
```

Step 3: Line Chart

```js
Plot.plot({
  title: "Traffic Stop Patterns by Hour and Race (2011 to 2015)",
  width: 1000,
  height: 500,
  marginLeft: 80,
  marginRight: 250,
  marginBottom: 60,
  marginTop: 40,
  grid: true,
  
  x: {
    label: "Hour of Day",
    labelAnchor: "center",
    domain: [0, 23]
  },
  
  y: {
    label: "Percentage of Stops",
    domain: [0, 100],
    grid: true
  },
  
  color: {
    legend: true,
    domain: ["Black", "White"],
    range: ["#ff7f0e", "#1f77b4"]
  },
  
  marks: [
    Plot.ruleY([0]),
    
    // Line for each race with tooltips
    Plot.lineY(hourlyPercentages, {
      x: "hour",
      y: "percentage",
      stroke: d => d.race == "Black" ? "#ff7f0e" : "#1f77b4",
      strokeWidth: 3,
      marker: "circle",
      tip: true,  // Enables tooltips!
      title: d => `${d.race}: ${d.percentage.toFixed(1)}%`  // Custom tooltip text
    }),
    
    // Vertical lines marking twilight period (hours 18-21)
    Plot.ruleX([18], {
      stroke: "gray",
      strokeWidth: 2,
      strokeDasharray: "4,4"
    }),
    Plot.ruleX([21], {
      stroke: "gray",
      strokeWidth: 2,
      strokeDasharray: "4,4"
    })
  ]
})
```


Visualization for the argument of Veil of darkness:


```js
// Filter to 2015, Black drivers, January OR August
const stops2015BlackJanAug = stopsWithDateTime.filter(
  (d) => {
    if (d.year === 2015 && d.race === "black" && (d.month === 1 || d.month === 8)) {
      return true
    }
  }
)
```

```js
// 2-level rollup: hour > month
const afByHourMonth = twoLevelRollUpFlatMap(
  stops2015BlackJanAug,
  "hour",
  "month",
  "count"
)
```

```js
// January line (month 1, hours 17-21)
const januaryEvening = afByHourMonth.filter(
  (d) => {
    if (d.month == 1 && d.hour >= 16 && d.hour <= 23) {
      return true
    }
  }
)

// August line (month 8, hours 17-21)
const augustEvening = afByHourMonth.filter(
  (d) => {
    if (d.month == 8 && d.hour >= 16 && d.hour <= 23) {
      return true
    }
  }
)
```
```js
// Create new sorted arrays
const januaryEveningSorted = januaryEvening.slice().sort((a, b) => a.hour - b.hour)

const augustEveningSorted = augustEvening.slice().sort((a, b) => a.hour - b.hour)
```

```js
// Calculate percentages for January
for (const row of januaryEveningSorted) {
  // Calculate total stops for ALL January evening hours
  const januaryTotal = d3.sum(januaryEveningSorted, d => d.count)
  
  // Calculate percentage for this hour
  row.percentage = (row.count / januaryTotal) 
}

// Calculate percentages for August  
for (const row of augustEveningSorted) {
  // Calculate total stops for ALL August evening hours
  const augustTotal = d3.sum(augustEveningSorted, d => d.count)
  
  // Calculate percentage for this hour
  row.percentage = (row.count / augustTotal)
}
```

```js
Plot.plot({
  title: "Black Driver Stops: January vs August (2015)",
  width: 1000,
  height: 500,
  marginLeft: 80,
  marginBottom: 40,
  marginTop: 10,
  marginRight: 250,
  grid: true,
  
  x: {
    label: "Hour of Day",
    domain: [16, 17, 18, 19, 20, 21, 22, 23, 0]
  },
  
  y: {
    label: "percNA",
    percent: true,  
  },
  
  marks: [
    Plot.ruleY([0]),
    
    Plot.lineY(
      augustEveningSorted,
      {
        x: "hour",
        y: "percentage",  
        stroke: "black",
        tip: true
      }
    ),
    
    Plot.lineY(
      januaryEveningSorted,
      {
        x: "hour",
        y: "percentage",  
        stroke: "black",
        strokeDasharray: "8,4",
        tip: true
      }
    ),
    Plot.text(
      [{x: 23, y: 0.18}],
      {
        x: "x",
        y: "y",
        text: ["August (Summer)"],
        fill: "black",
        fontSize: 12,
        dx: 55
      }
    ),
    
    // Text label for January
    Plot.text(
      [{x: 23, y: 0.20}],
      {
        x: "x",
        y: "y",
        text: ["January (Winter)"],
        fill: "black",
        fontSize: 12,
        dx: 55
      }
    )
  ]
})
```



Overview plot

```js
// Group ALL stops (all years, all data) by hour and race
const overviewStopsByHourRace = twoLevelRollUpFlatMap(
  stopsWithDateTime,
  "hour",
  "race",
  "count"
)

// Sort by hour (0-23)
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
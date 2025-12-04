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





























Visualization 2: Daylight vs Darkness comparison

Step 1: Group the data

```js
// Group stops by light condition and race
const stopsByLightRace = twoLevelRollUpFlatMap(
  stopsWithDateTime,
  "light_condition",
  "race",
  "count"
)
```

```js
// Check the output
stopsByLightRace
```

Step 2: Calculate Percentage

```js
// Calculate percentages for each light condition
const lightConditionComparison = []

// Loop through Daylight and Darkness
const conditions = ["Daylight", "Darkness"]

for (const condition of conditions) {
  
  // Get stops for this condition
  const stopsForCondition = stopsByLightRace.filter(d => d.light_condition === condition)
  
  // Find Black and White counts
  let blackCount = 0
  let whiteCount = 0
  
  for (const row of stopsForCondition) {
    if (row.race === "black") {
      blackCount = row.count
    }
    if (row.race === "white") {
      whiteCount = row.count
    }
  }
  
  // Calculate total and percentages
  const totalCount = blackCount + whiteCount
  
  const blackPercentage = (blackCount / totalCount) * 100
  const whitePercentage = (whiteCount / totalCount) * 100
  
  lightConditionComparison.push({
    condition: condition,
    race: "Black",
    percentage: blackPercentage,
    count: blackCount,
    total: totalCount
  })
  
  lightConditionComparison.push({
    condition: condition,
    race: "White",
    percentage: whitePercentage,
    count: whiteCount,
    total: totalCount
  })
}
```

```js
// Check the output
lightConditionComparison
```

Step 3: Visualization

```js
import {html} from "npm:htl"
```

<div style="font-family: sans-serif; max-width: 600px;">
  <h3>Daylight vs Darkness: Stop Rate Comparison</h3>
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <thead>
      <tr style="background: #f0f0f0;">
        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Light Condition</th>
        <th style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #ff7f0e;">Black Drivers (%)</th>
        <th style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #1f77b4;">White Drivers (%)</th>
        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Difference</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Daylight</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; font-size: 18px; color: #ff7f0e;">52.8%</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; font-size: 18px; color: #1f77b4;">47.2%</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">5.6 pp</td>
      </tr>
      <tr style="background: #f9f9f9;">
        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Darkness</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; font-size: 18px; color: #ff7f0e;">59.2%</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; font-size: 18px; color: #1f77b4;">40.8%</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">18.4 pp</td>
      </tr>
      <tr style="background: #fff3cd; font-weight: bold;">
        <td style="padding: 12px; border: 1px solid #ddd;">Change</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #ff7f0e;">+6.4 pp ↑</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #1f77b4;">-6.4 pp ↓</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">—</td>
      </tr>
    </tbody>
  </table>
  <p style="margin-top: 20px; color: #666; font-size: 14px;">pp = percentage points</p>
</div> 





Visualization 3: Twilight Period

Step 1: 

```js
// Filter to twilight period only (hours 18-21)
const twilightStops = stopsWithDateTime.filter(d => d.twilight_period === true)
```

```js
// Group by hour, light condition, and race
const twilightByHourLightRace = threeLevelRollUpFlatMap(
  twilightStops,
  "hour",
  "light_condition",
  "race",
  "count"
)
```

```js
// Check the output
twilightByHourLightRace
```

Step 2: Calculate Black Driver Percentage

```js
// Calculate Black driver percentage for each hour and light condition
const twilightBlackPercentages = []

// Loop through hours 18-21
const twilightHours = [18, 19, 20, 21]

for (const hour of twilightHours) {
  
  // Loop through Daylight and Darkness
  for (const condition of ["Daylight", "Darkness"]) {
    
    // Get stops for this hour and condition
    const stopsForCell = twilightByHourLightRace.filter(
      d => d.hour === hour && d.light_condition === condition
    )
    
    // Find Black and White counts
    let blackCount = 0
    let whiteCount = 0
    
    for (const row of stopsForCell) {
      if (row.race === "black") {
        blackCount = row.count
      }
      if (row.race === "white") {
        whiteCount = row.count
      }
    }
    
    // Calculate percentage
    const totalCount = blackCount + whiteCount
    
    if (totalCount > 0) {
      const blackPercentage = (blackCount / totalCount) * 100
      
      twilightBlackPercentages.push({
        hour: hour,
        condition: condition,
        black_percentage: blackPercentage,
        total_stops: totalCount
      })
    }
  }
}
```

```js
// Check the output
twilightBlackPercentages
```

Step 3: Visualization

```js
Plot.plot({
  title: "Black Driver Stop Rates: Daylight vs Darkness by Hour",
  width: 900,
  height: 500,
  marginLeft: 80,
  marginRight: 250,
  marginBottom: 80,
  grid: true,
  
  x: {
    label: "Hour of Day",
    labelAnchor: "center",
    domain: [18, 19, 20, 21],
    ticks: [18, 19, 20, 21]
  },
  
  y: {
    label: "Percentage of Stops that are Black Drivers (%)",
    domain: [50, 65],
    grid: true
  },
  
  marks: [
    Plot.ruleY([0]),
    
    // Daylight line (solid)
    Plot.lineY(
      twilightBlackPercentages.filter(d => d.condition === "Daylight"),
      {
        x: "hour",
        y: "black_percentage",
        stroke: "#2c7bb6",
        strokeWidth: 3,
        marker: "circle"
      }
    ),
    
    // Darkness line (dashed)
    Plot.lineY(
      twilightBlackPercentages.filter(d => d.condition === "Darkness"),
      {
        x: "hour",
        y: "black_percentage",
        stroke: "#d7191c",
        strokeWidth: 3,
        strokeDasharray: "8,4",
        marker: "circle"
      }
    ),
    
    // Dots with tooltips
    Plot.dot(twilightBlackPercentages, {
      x: "hour",
      y: "black_percentage",
      fill: d => d.condition === "Daylight" ? "#2c7bb6" : "#d7191c",
      r: 6,
      tip: true,
      title: d => `Hour ${d.hour} (${d.condition}): ${d.black_percentage.toFixed(1)}%`
    })
  ]
})
```

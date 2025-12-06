```js
import {oneLevelRollUpFlatMap,twoLevelRollUpFlatMap,threeLevelRollUpFlatMap,getUniquePropListBy,mapDateObjectForStops} from "./utils/utilsH1.js"
```
# Testing the Veil of Darkness: Temporal Analysis of Traffic Stop Disparities

## The Veil of Darkness Theory

In the previous chapter, we established that Black drivers in Raleigh face compounding disparities. They are stopped at rates 1.66 times their population share and searched at rates 2.2 times higher than White drivers. This raises a fundamental question: Why do these disparities exist?
One explanation is that officers use visual racial identification when deciding who to stop. The Veil of Darkness test provides a way to test this. Throughout the year, sunset times change dramatically. The same clock time (like 6:30 PM) is bright daylight in summer but complete darkness in winter. If officers are using race to make stop decisions, we should see more minority stops during daylight and fewer during darkness. This chapter tests whether this effect exists in Raleigh's traffic stop data from 2011 to 2015.

## Understanding Daily Stop Patterns

Before testing the Veil of Darkness theory, we need to understand when traffic stops occur throughout a typical day.

```js
// Load the data
const raleighStops = FileAttachment("./data/policestops-with-townships.csv").csv({typed: true})
```
```js
const stopsWithDateTime = []

for (const stop of raleighStops) {
  const dateObject = new Date(stop.datetime)
  const year = dateObject.getFullYear()
  const month = dateObject.getMonth() + 1
  const hour = dateObject.getHours()
  const minute = dateObject.getMinutes()
  
  // Determine daylight condition
  let daylight
  
  // Peak summer (June-July): Daylight until 9pm
  if (month == 6 || month == 7) {
    daylight = hour < 21
  }
  // Early/late summer (May, August): Daylight until 8pm
  else if (month == 5 || month == 8) {
    daylight = hour < 20
  }
  // Winter (Nov-Feb): Dark by 6pm
  else if (month == 11 || month == 12 || month == 1 || month == 2) {
    daylight = hour < 18
  }
  // Spring/Fall (Mar-Apr, Sep-Oct): 7pm cutoff
  else {
    daylight = hour < 19
  }
  
  // Determine light condition
  let light_condition
  if (daylight == true) {
    light_condition = "Daylight"
  } else {
    light_condition = "Darkness"
  }
  
  // Determine twilight period
  let twilight_period
  if (hour >= 18 && hour <= 21) {
    twilight_period = true
  } else {
    twilight_period = false
  }
  
  // Push the COMPLETE object with ALL fields
  stopsWithDateTime.push({
    id: stop.id,
    datetime: stop.datetime,
    race: stop.race,
    sex: stop.sex,
    search_conducted: stop.search_conducted,
    year: year,
    month: month,
    hour: hour,
    minute: minute,
    light_condition: light_condition,
    twilight_period: twilight_period
  })
}
```

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
  title: "Traffic Stop Patterns by Hour and Race (2011 to 2015)",
  width: 900,
  height: 500,
  marginLeft: 80,
  marginBottom: 80,
  marginTop: 40,
  marginRight: 250,
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

This visualization shows that traffic stops drop to their lowest levels during early morning hours (0-6 AM), with all racial groups following similar patterns. Stop activity surges during morning rush hour (7-11 AM), with peak enforcement around 8-9 AM, followed by a smaller afternoon peak (2-4 PM). The most striking feature is the dramatic evening spike from 8 PM onward. Black drivers experience a massive surge during these late hours, climbing to over 11,000 stops at hour 22 (10 PM), the highest concentration for any racial group at any time.

**What This Means:** Traffic stops are not evenly distributed throughout the day. The late evening hours (20-23) show the most intense enforcement and the largest racial disparities. This raises our critical question: Are these evening disparities related to lighting conditions?

## Seasonal Variation by Hour

Now we conduct the Veil of Darkness test by comparing Black driver stop patterns during winter (darkness) versus summer (daylight). We focus on evening hours 16-23, comparing winter months (December, January, February, dark by 6 PM) with summer months (June, July, August, daylight until 8-9 PM). If the Veil of Darkness effect exists, we should see different patterns during twilight hours (18-20).

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
  marginRight: 250,
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

The two lines are remarkably similar, tracking together almost perfectly across all evening hours. Hour 18 (6:00 PM) provides the clearest test, as lighting conditions differ most dramatically:

- Winter (darkness): 4.75% of stops
- Summer (daylight): 4.626% of stops
- Difference: Only 0.124 percentage points

This tiny difference is in the wrong direction. If the Veil of Darkness theory applied, summer (when race is visible) should show a higher percentage than winter. The near-identical distributions provide minimal evidence that lighting conditions affect stop patterns in Raleigh, suggesting that officers' ability to visually identify race is not a primary driver of the disparities documented in the previous chapter.


## Light Conditions and Stop Distribution

Our seasonal comparison showed nearly identical patterns. We can test this another way: since sunset times vary throughout the year, we can compare daylight versus darkness stops at the same clock hours.

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

<!-- #### Location
- **Average mean**: ${(d3.mean(blackWhiteOnly, d => d.percentage) * 100).toFixed(2)}%
- **Median**: ${(d3.median(blackWhiteOnly, d => d.percentage) * 100).toFixed(2)}%
- **Mode**: ${(d3.mode(blackWhiteOnly, d => d.percentage) * 100).toFixed(2)}%

#### Spread
- **Range**: ${d3.min(blackWhiteOnly, d => d.percentage)} to ${d3.max(blackWhiteOnly, d => d.percentage)}, (or ${(d3.min(blackWhiteOnly, d => d.percentage)*100).toFixed(2)}% to ${(d3.max(blackWhiteOnly, d => d.percentage)*100).toFixed(2)}%).

- **Variance of traffic stops**: ${d3.variance(stopPercentages).toFixed(10)}

- **Standard deviation of traffic stops**: On average, all traffic stops per hour deviate from the mean by <strong>${(100 * d3.deviation(stopPercentages)).toFixed(2)}%</strong>. -->


```js
Plot.plot({
  title: "Traffic Stop Distribution by Hour, Race, and Light Condition",
  width: 1000,
  height: 500,
  marginLeft: 80,
  marginBottom: 60,
  marginTop: 30,
  marginRight: 250,
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
        fill: d => d.race == "black" ? "#ff7f0e" : "#1f77b4",
        r: 5,
        tip: true,
        title: d => `${d.race}, ${d.light_condition}\nHour ${d.hour}: ${(d.percentage * 100).toFixed(2)}%`
      }
    )
  ]
})
```

This dot plot shows each combination of hour, race, and light condition as a percentage of total Black and White stops. The gray dashed line represents the mean at 1.86%. Hours 17-20 show 4 dots, representing twilight hours where both daylight and darkness data exist at the same clock time.

At hour 18, darkness stops show White 0.26% and Black 0.34%, while daylight stops show White 0.53% and Black 0.60%. At hour 20, the difference is more pronounced: darkness stops show White 1.89% and Black 2.27%, while daylight stops show White 0.34% and Black 0.50%. However, the racial disparity remains relatively consistent across lighting conditions, suggesting lighting does not substantially change which racial groups are stopped.

This reinforces our earlier finding. Something other than officers' ability to see race through car windows is driving these patterns. Possible factors include:

- Different enforcement priorities or patrol patterns in late night hours.
- Location-based enforcement targeting neighborhoods with higher Black populations.
- Vehicle characteristics or driving patterns used as proxies for race.
- Systematic differences in who is on the road during different times.

## Reason for Stops over Time

Here, we will now check if Black and white drivers are disproportionately stopped for different  reasons which could reveal where disparities are most concentrated.

```js
const stopsWithCategory = []

for (const stop of raleighStops) {
  // Only include Black and White drivers
  if (stop.race == "black" || stop.race == "white") {
    
    let category
    
    // Category 1: Serious/Moving Violations

    if (stop.reason_for_stop == "Speed Limit Violation" || stop.reason_for_stop == "Stop Light/Sign Violation" || stop.reason_for_stop == "Safe Movement Violation" || stop.reason_for_stop == "Driving While Impaired") {
      category = "Serious Violations"
    }

    // Category 2: Minor/Equipment Violations

    else if (stop.reason_for_stop == "Vehicle Regulatory Violation" || stop.reason_for_stop == "Vehicle Equipment Violation") { category = "Equipment Violations" }

    // Category 3: Discretionary/Other

    else {
      category = "Discretionary Stops"
    }
    
    const dateObject = new Date(stop.datetime)
    
    stopsWithCategory.push({
      race: stop.race,
      category: category,
      hour: dateObject.getHours()
    })
  }
}
```


```js
// Three-level rollup: hour > race > category
const stopsByHourRaceCategory = threeLevelRollUpFlatMap(
  stopsWithCategory,
  "hour",
  "race",
  "category",
  "count"
)
```

```js
const heatmapCategoryData = []
for (const row of stopsByHourRaceCategory) {
  const combinedCategory = row.race + " - " + row.category
  
  heatmapCategoryData.push({
    hour: row.hour,
    category: combinedCategory,
    count: row.count
  })
}
```

```js
Plot.plot({
  title: "Traffic Stop Categories by Hour, Race, and Violation",
  width: 1000,
  height: 600,
  marginLeft: 200,
  marginBottom: 60,
  marginTop: 20,
  marginRight: 150,
  
  x: {
    label: "Hour of Day",
    domain: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
  },
  
  y: {
    label: null,
    domain: [
      "black - Serious Violations",
      "black - Equipment Violations",
      "black - Discretionary Stops",
      "white - Serious Violations",
      "white - Equipment Violations",
      "white - Discretionary Stops"
    ]
  },
  
  color: {
    scheme: "Viridis",
    legend: true,
    label: "Number of Stops"
  },
  
  marks: [
    Plot.cell(
      heatmapCategoryData,
      {
        x: "hour",
        y: "category",
        fill: "count",
        tip: true,
      }
    ),
    
    Plot.text(
      heatmapCategoryData,
      {
        x: "hour",
        y: "category",
        text: d => d.count,
        fill: "white",
        fontSize: 9
      }
    )
  ]
})
```

This heatmap uses color intensity (Viridis scale: dark purple = few stops, bright yellow = many stops) to show stop patterns across 24 hours for six categories (Black and White drivers, each with three violation types).

The Equipment Violations row for Black drivers stand out most. Notice the bright yellow cells at hours 20-23, indicating 5,367 to 5,835 stops. These are the highest concentrations anywhere on the heatmap. This is significant because equipment violations (broken tail lights, expired registration) are often considered "pretextual" stops where officers use minor technical violations as justification to stop drivers they want to investigate for other reasons. Looking at the Serious Violations rows, we see a different story. Black drivers show serious violations peaking at hours 20-22 (2,612 to 3,662 stops), while White drivers show peaks at hours 8-10 (4,802 to 5,395 stops). White drivers actually have higher serious violation stops during daytime rush hours, which makes sense given commuting patterns and speed enforcement.

The Veil of Darkness test gave us a null result, but that null result is itself meaningful. It narrows our focus to the true drivers of disparity: not what officers can see, but where they patrol, what violations they prioritize, and how much discretion they exercise.
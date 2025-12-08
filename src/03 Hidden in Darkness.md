```js
import {oneLevelRollUpFlatMap,twoLevelRollUpFlatMap,threeLevelRollUpFlatMap,getUniquePropListBy,mapDateObjectForStops} from "./utils/utilsH1.js"
```
# Testing the Veil of Darkness: Temporal Analysis of Traffic Stop Disparities

## The Veil of Darkness Theory

In the previous chapter, we showed that Black drivers in Raleigh face significant disparities. They are:
- Stopped at rates **1.66x** higher than their share of the population.
- Searched at rates **2.2x** higher than White drivers.
This raises a key question: Why do these disparities exist?

Sunset times change throughout the year. For example, at 6:30 PM:
- In summer, it’s still bright daylight.
- In winter, it’s already completely dark.


If officers are using race as a factor in stop decisions, we would expect:
- More minority drivers stopped in **daylight**, when race is visible.
- Fewer minority drivers stopped in **darkness**, when race is harder to see.



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

The visualization shows clear patterns in when traffic stops occur:
- Early morning **(0–6 AM)**: Stops are at their lowest levels, with all racial groups following similar trends.
- Morning rush **(7–11 AM)**: Activity surges, peaking around 8–9 AM, when enforcement is strongest.
- Afternoon **(2–4 PM)**: There is a smaller secondary peak in stop activity.
- Evening **(8 PM and afterwards)**: The most striking feature is a dramatic spike in stops.

For Black drivers, this evening surge is especially pronounced. At 10 PM (hour 22), stops climb to over 11,000, which is the highest concentration recorded for any racial group at any time of day.


**What This Means:** Traffic stops aren't evenly distributed throughout the day. The late evening hours especially shows surges in traffic stops. This begs the question, do lighting conditions attribute to this pattern?

## Seasonal Variation by Hour

To test whether race influences stop decisions, we compare Black driver stop patterns in **Winter** versus **Summer**.
- Evening hours (**16–23**): This is our focus period.
- **Winter** months (December–February): Darkness falls by 6 PM, so stops during these hours occur mostly in the dark.
- **Summer** months (June–August): Daylight lasts until 8–9 PM, meaning stops in the same hours occur mostly in daylight.

The key comparison is during what we call the twilight window (**18–20**).
 If the Veil of Darkness effect exists, we should see different stop patterns between **Winter** (darkness) and **Summer** (daylight).


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

As we can see, the two lines are nearly the same, barring the evening. Hour 18 (6:00 PM) provides the clearest test, since lighting is so different here:

- **Winter** (darkness): 4.75% of stops
- **Summer** (daylight): 4.626% of stops
- Difference: Only 0.124 percentage points

This percentage is small, and is in the direction of showing more Black drivers being arrested in the dark. If the Veil of Darkness theory applied, summer (when race is visible) should show a higher percentage than winter. This means that officers' ability to identify race is ***not*** a primary reason of the disparities documented previously.


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

This dot plot shows each combination of hour, race, and light condition as a percentage of total Black and White stops. 

The gray dashed line represents the mean at **1.86%**.

 Hours 17-20 show 4 dots, which represent our twilight hours where both daylight and darkness can exist at the same time within our data.

At hour 18, darkness stops show:

-  White drivers **0.26%** and Black drivers **0.34%**
 
 While daylight stops show: 
 - White drivers **0.53%** and Black drivers **0.60%.**
 
 At hour 20, the contrast becomes clearer. During darkness, stops show:
 -  White drivers at **1.89%** and Black drivers at **2.27%**.
 
  In daylight, the figures drop:
  
   - To **0.34%** for White drivers and **0.50%** for Black drivers. 
   
   Despite this shift, the overall stop rate remains steady across different hours, showing us that whether night or day, light doesn't play that large of a role in which racial groups are stopped.

This reinforces our earlier finding. Something other than officers' ability to see race through car windows is driving these patterns. Possible factors include:

- Late night enforcement protocols
- How overpoliced locations are
- Awareness based on holidays and events
- End of year vs. middle of year deployment practices

## Reason for Stops over Time

Here, we'll check if Black and white drivers the differences in reasoning for stops, are Black drivers stopped for certain reasons?

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

This heatmap uses color to indicate intensity; 

Dark Purple = few stops

Bright Yellow = many stops

  This shows stop patterns across 24 hours for six categories (Black and White drivers, each with three violation types).

**The Equipment Violations** row for Black drivers is the most striking feature of the heatmap. Between hours 20–23 (8–11 PM), the bright yellow cells show **5,367** to **5,835** stops, the highest concentration anywhere on the chart. This matters because equipment violations, such as broken tail lights or expired registration, are often seen as “pretextual” stops, where officers use minor technical issues as a reason to investigate drivers for other concerns.

**The Serious Violations** rows tell a different story. For Black drivers, serious violations peak later in the evening, around hours 20–22 (**2,612** to **3,662** stops). For White drivers, however, the peak occurs earlier, during the morning rush (hours 8–10), with **4,802** to **5,395** stops. This daytime pattern aligns with commuting traffic and speed enforcement, which naturally produces more serious violations during busy travel hours.


The Veil of Darkness test made us ***reject our hypothesis***, but this is not negative. Rather, i\\\\\\\\\\\\\\\\\t narrows our focus to the true reasons to why Black drivers are disproportionately arrested. Our data helped us look at traffic stops in the lens of date and time, and despite our hypothesis being incorrect, it helped us realize that perhaps our focus should be shifted towards these other reasons for stops.
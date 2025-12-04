# H3: Punished Unequally: An Outcomes Based Analysis
```js
import {oneLevelRollUpFlatMap,twoLevelRollUpFlatMap,threeLevelRollUpFlatMap,getUniquePropListBy,mapDateObjectForStops} from "./utils/utilsH1.js";
```
## Overview

This chapter provides an in-depth analysis of the outcomes black and white driver's face for traffic stops. It analyzes officer's reasons officers stop drivers in conjunction with outcomes, and looks to uncover distinct patterns in the penalties driver's may recieve for getting pulled over.

This involves three variables in our dataset: race, reason_for_stop, and outcome.

**Hypothesis**

Our hypothesis, or h3, is: Black drivers receive harsher outcomes than White drivers for the same violations, with fewer warnings and more arrests. This happens because officers exercise discretion based on race, escalating punishment for Black drivers. Without standardized protocols, discriminatory outcomes will persist, but objective enforcement guidelines can reduce racial-based disparities.

### Research Question
**Are black drivers searched for similar reasons to white drivers, and are these searches jutified by contraband found?**

Let's investigate the data to find out!

## Load the data
```js
const raleighStops = FileAttachment("./data/policestops-with-townships.csv").csv({typed: true})
```

<p class="codeblock-caption">
  Interactive output of our full dataset <code>raleighStops</code>
</p>

```js
raleighStops
```

## Normalizing The Data
Before we begin, let's normalize our data based on population. As of the most recent census data, whites accounted for 59.1 percent of Raleigh's total population and the black population represented only 21.9 percent. Let's adjust our data to reflect this, by mapping racial categories to population ratios and then outputting the data grouped by race with normalized frequencies.

```js
const raleighPop = 131023
const raleighPopRatios = new Map([
  ["white", 0.591*raleighPop],
  ["black", 0.219*raleighPop],
  ["hispanic", 0.096*raleighPop],
  ["native", 0.003*raleighPop],
  ["asian/pacific islander", 0.044*raleighPop],
  ["unknown", null],
  ["other", null],
])
```
```js
const raleighStopsByRace = d3.rollups(
  raleighStops,
  (leaves) => {
    /** Adjust for population
     *  If .race is not the unknown category, use formula.
    **/
    if (leaves[0].race != "unknown" && leaves[0].race != "other") {
      return {
        race: leaves[0].race,
        stopFreq: leaves.length,
        // Use the normalizing formula and mapped ratio value by race
        normalizedStopFreq: leaves.length / raleighPopRatios.get(leaves[0].race),
      }
    }
    else {
      return {
        race: leaves[0].race,
        stopFreq: leaves.length,
        // We can't account for the "unknown" race value in the data,
        // so set it to null.
        normalizedStopFreq: null,
      }
    }
  },
  (d) => d.race,
)

// Flatten the rolledup Map
const flatStopsByRace = raleighStopsByRace.map(
  ([race, racesList]) => {
    return racesList
  }
)
```

```js
flatStopsByRace
```

```js

Plot.plot({
  title: "Raleigh Traffic Stops by Race",
  width: 1100,
  grid: true,
  marginLeft: 100,
  marginRight: 0,
  marginBottom: 60,
  marginTop: 60,
  x: {label: "Race", padding: 0},
  y: {label: "Normalized Stop Freq", padding: 0},
  color: {legend: true},
  marks: [
    Plot.ruleY([0]),
    Plot.axisX({label: null, lineWidth: 8, marginBottom: 40}),
    Plot.barY(
      flatStopsByRace.filter((d) => (d.race != "other" && d.race != "unknown")),
      {
        x: "race",
        y: "normalizedStopFreq",
        insetRight: 10,
        insetLeft: 10,
        tip: true,
        sort: {x: "-y"},
      }
    )
  ]
})
```
```js
// Population data

```

## Part 1: Reason For Stop

Since chapter two *Stopped and Searched* has already outlined the racial compostion of our dataset, I will begin with investigating if the reasons black drivers are getting pulled over are comparable to white ones. This will involve an analysis of the *reason_for_stop* category. 

There are ten reasons for police stops represented in our dataset.

1. Vehicle Regulatory Violation
2. Vehicle Equipment Violation
3. Stop Light/Sign Violation
4. Seat Belt Violation
5. Speed Limit Violation
6. Safe Movement Violation
7. Driving While Impaired
8. Motor Vehicle Violation
9. Other Motor Vehicle Violation
10. Checkpoint

Let's first check the frequency of each stop by race.

```js
// 1. Rollup by ____
const afRaceByReason = d3.rollups(
  raleighStops,
  v => v.length,
    d => d.race,
    d => d.reason_for_stop
).flatMap(([race, reasons]) =>
  reasons.map(([reason_for_stop, count]) => ({race, reason_for_stop, count}))
)
//LevelRollUpFlatMap was producing different plot
```

```js
// 2. Add normalized AFs
const afRaceByReasonUpdated = afRaceByReason.map(
  (stop) => {
    let af = stop.count
    stop.normalizedCount = af / raleighPopRatios.get(stop.race)
    stop.raceAndReason = stop.race + "-" + stop.reason_for_stop
    return stop
  }
)
```

```js
afRaceByReasonUpdated
```

```js
Plot.plot({
  title: "Reason for Stop Racial Breakdown",
  width: 1100,
  grid: true,
  marginLeft: 100,
  marginRight: 0,
  marginBottom: 60,
  marginTop: 60,
  label: null,
  color: {legend: true},
  x: {label: "Reason for Stop", padding: 0},
  y: {label: "Absolute Frequency", padding: 0},
  marks: [
    Plot.ruleY([0]),
    Plot.axisX({label: null, lineWidth: 8, marginBottom: 40}),
    Plot.barY(
      afRaceByReasonUpdated,
      {
        x: "reason_for_stop",
        y: "normalizedCount",
        fill: "race",
        sort: {x: "-y"},
        insetRight: 10,
        insetLeft: 10,
        tip: true,
        color: {
    domain: ["White", "Black", "Hispanic", "Asian"],
    range: ["red", "blue", "green", "black"]
      }
    })
  ]
})
```
As evidenced here, Vehicle Regulatory and Speed Limit Violations are the primary reasons drivers are stopped. There were a higher number of black drivers pulled over for every category except Speed Limit and Driving While Impaired, a number even more startling when you considers Raleigh and Wake County's racial composition. Wake County as a whole, according to recent census data, is approximately **19** percent black and **57** percent white, and Raleigh is roughly **26** percent black and **51** percent white. Through this prelimiary analysis, we already start to see evidence of some of the biases posited in our hypothesis.

## Part 2: Outcome by Race

Next let's examine the Outcome category. This variable comprises three possibilities, including Citation, Warning, and Arrest.. In our dataset the black population is once again overrepresented in each category, particularly when considering Wake County and Raleigh's racial composition.

```js
// filter out NAs in outcomes
const filteredOutcome = raleighStops.filter(d => d.outcome != "NA")
// rollup
const raceOutcome = twoLevelRollUpFlatMap(
  filteredOutcome,
  "race",
  "outcome",
  "af",
)
```
<p class="codeblock-caption">
  Interactive Map output of Outcomes by <code>race</code>.
</p>

```js
raceOutcome
```
Here we see that black drivers are arrested at a substantially higher clip than white ones, 
(data).

### 2.1 Outcomes by Time

But how might this information vary by time? Have racially-motivated outcomes become more or less punitive over the years between 2011-2015? 

```js
const outcomeRaceDate = threeLevelRollUpFlatMap(
  filteredOutcome, 
  "datetime",
  "outcome",
  "race",
  "af"
)

```

```js
// Observable Horizon Chart Example
Plot.plot({
  height: 1100,
  width: 928,
  x: {axis: "top"},
  y: {domain: [0, step], axis: null},
  fy: {axis: null, domain: traffic.map((d) => d.name), padding: 0.05},
  color: {
    type: "ordinal",
    scheme: "Greens",
    label: "Vehicles per hour",
    tickFormat: (i) => ((i + 1) * step).toLocaleString("en"),
    legend: true
  },
  marks: [
    d3.range(bands).map((band) => Plot.areaY(traffic, {x: "date", y: (d) => d.value - band * step, fy: "name", fill: band, sort: "date", clip: true})),
    Plot.axisFy({frameAnchor: "left", dx: -28, fill: "currentColor", textStroke: "white", label: null})
  ]
})
```

## Part 3: Reason For Stop By Outcome and Race

Through an analysis of each of these categories, we start to see some patterns. Considering the sheer amount of Vehicle Regulatory and Speed Limit Violations, plus lowered severity compared to other reasons for stop represented in our dataset, such as driving while impaired, how many of each resulted in arrests or citations for black and white drivers? 


```js
const stopsWithReasonOutcome = raleighStops.filter(
d => d.outcome != "NA" && d.reason_for_stop != "NA"
)

const raceOutcomeReason = threeLevelRollUpFlatMap(
  stopsWithReasonOutcome,
  "race",
  "outcome",
  "reason_for_stop",
  "af"
)
```
```js
// Reducer function for reason_for_stop arrest or citation
// Returns count if arrest or citation was made for VRV or SLV
const reasonReducer = (d) => {
  const vrv = d.reason_for_stop == "Vehicle Regulatory Violation"
  const slv = d.reason_for_stop == "Speed Limit Violation"

  const arrestOrCitation = d.outcome == "arrest" || d.outcome == "citation"

 if ((vrv || slv) && arrestOrCitation) {
  return d.count
} else {
  return 0
}
}

// Reducer function for reason_for_stop warning
// Returns count if warning was issued for VRV or SLV
const warningReducer = (d) => {
  const vrv = d.reason_for_stop == "Vehicle Regulatory Violation"
  const slv = d.reason_for_stop == "Speed Limit Violation"

  const isWarning = d.outcome == "warning"

  if ((vrv || slv) && isWarning) {
    return d.count
  } else {
    return 0
  }
}
```

```js
// Get all unique races from the data
const uniqueRaceList = getUniquePropListBy(
  raceOutcomeReason,
  "race"
)

// Reducer functions objectified
const reducerFuncs = [
  {
    type: "Arrest or Citation",
    func: reasonReducer
  },
  {
    type: "Warning",
    func: warningReducer
  }
]
```
```js
// Create array for results
const arrestOrCitationResults = []

// Loop through all RACE values
for (const raceValue of uniqueRaceList) {

  // Loop through reducer functions
  for (const testorObj in reducerFuncs) {

    const totalSearchesForRace = d3.sum(
      raceSearchContraband,
      (d) => {
        if (d.race == raceValue && d.search_conducted == "TRUE") {
          return d.count
        }
      }
    )

    // Calculate the sum for FOUND or NOT_FOUND using the reducer function
    const summedUpLevel = d3.sum(
      raceSearchContraband,
      (d) => {
        if (d.race == raceValue && d.search_conducted == "TRUE") {
          const xTotalToSum = reducerFuncs[testorObj]["func"](d)
          return xTotalToSum
        }
      }
    )

    // Push results
    contrabandPercResults.push({
      race: raceValue,
      contraband_status: reducerFuncs[testorObj]["type"],
      count: summedUpLevel,
      total_searches: totalSearchesForRace,
      percentage: summedUpLevel / totalSearchesForRace,
    })
  }
}
```







## Key Findings

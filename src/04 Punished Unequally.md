# H3: Punished Unequally: An Outcomes Based Analysis
```js
import {oneLevelRollUpFlatMap,twoLevelRollUpFlatMap,threeLevelRollUpFlatMap,getUniquePropListBy,mapDateObjectForStops,addDateAndTimeFeatures,getRace} from "./utils/utilsH1.js";
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

```js
// Add date and time features
const updatedRaleighStops = addDateAndTimeFeatures(raleighStops)
```

<p class="codeblock-caption">
  Interactive output of our full dataset <code>raleighStops</code>
</p>

```js
raleighStops
```

## Normalize The Data
Before we begin, let's normalize our data based on population. As of the most recent census data, whites accounted for 59.1 percent of Raleigh's total population and the black population represented only 21.9 percent. Let's adjust our data to reflect this by mapping racial categories to population ratios and then outputting the data grouped by race with normalized frequencies.

```js
const raleighPop = 131023
const raleighPopRatios = new Map([
  ["white", 0.591*raleighPop],
  ["black", 0.219*raleighPop],
  ["hispanic", 0.096*raleighPop],
  ["native", 0.003*raleighPop],
  ["asian/pacific islander", 0.044*raleighPop],
  ["unknown", null],
])
```
```js
const raleighStopsByRace = d3.rollups(
  raleighStops,
  (leaves) => {
    /** Adjust for population
     *  If .race is not the unknown category, use formula.
    **/
    if (leaves[0].race != "unknown") {
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
As evidenced here, Vehicle Regulatory and Speed Limit Violations are the primary reasons drivers are stopped. There were a higher number of black drivers pulled over for every category except Speed Limit and Driving While Impaired, a number even more startling when you considers Raleigh and Wake County's racial composition. Black drivers are roughly **1.3** times more likely than white drivers to get pulled over for Vehicle Regulatory Violations, and **.7** times more likely to get pulled over for possible speeding infractions. Through this prelimiary analysis, we already start to see evidence of some of the biases posited in our hypothesis.

## Part 2: Outcome by Race
Next let's examine the Outcome category. This variable comprises three possibilities, including Citation, Warning, and Arrest. In our dataset the black population is once again overrepresented in each category, particularly when considering Wake County and Raleigh's racial composition.

```js
// Roll Up Data
const afRaceByOutcome = d3.rollups(
  raleighStops,
  v => v.length,
    d => d.race,
    d => d.outcome
).flatMap(([race, outcomes]) =>
  outcomes.map(([outcome, count]) => ({race, outcome, count}))
)
//map normalized data
const afRaceByOutcomeUpdated = afRaceByOutcome.map(
 (stop) => {
   let af = stop.count
   stop.normalizedCount = af / raleighPopRatios.get(stop.race)
   stop.raceAndReason = stop.race + "-" + stop.outcome
   return stop
 }
)

// filter "other" and "un"
const afRaceByOutcomeFiltered = afRaceByOutcomeUpdated.filter(d => d.race != "other" && d.race != "unknown" && d.outcome != "NA" )
```
```js
Plot.plot({
  title: "Stop Outcomes by Race (Normalized by Population)",
  width: 1200,
  height: 600,

  // One panel per outcome
  facet: {
    data: afRaceByOutcomeFiltered,
    x: "outcome",
    label: "Outcome"
  },

  marginLeft: 120,
  marginBottom: 60,
  grid: true,

  x: {
    label: "Normalized Count",
    grid: true,
    domain: [0, d3.max(afRaceByOutcomeUpdated, d => d.normalizedCount) * 1.1]
  },

  y: {
    label: "Race",
    domain: [...new Set(afRaceByOutcomeFiltered.map(d => d.race))]
  },

  marks: [
    Plot.ruleX([0]),
    Plot.dot(afRaceByOutcomeFiltered, {
      x: "normalizedCount",
      y: "race",
      fill: "#9c2007",
      r: 7,
      tip: true
    })
  ]
})
```


We see that black drivers are **3.4** times more likely than white drivers to receive a warning compared to white ones, **2.9** times more likely to recieve a citation, and more than ***4*** times more likely to be arrested. But how might this data fluctuate? Are there certain times of the year when arrests and citations might be more frequent than warnings, and vice versa?


### 2.1 Outcomes by Time
In the following Horizon Chart, we see that most outcomes for all races tend to spike in the spring and early summer months. This would make sense due to warmer weather, longer days, and therefore more drivers on the road, but might there be another motive at play?

**Police quotas** requiring specific numbers of tickets/arrests are currently [illegal](https://www.ncleg.gov/EnactedLegislation/Statutes/PDF/BySection/Chapter_20/GS_20-187.3.pdf) in the state of North Carolina, a law which was *not* active during the time period our dataset represents. Quotas tie officer's pay to volume of arrests and citations, rather than performance metrics, and extra money is typically paid out in the form of *holiday bonuses*. With the increased prevalence of traffic stops in the summer months, and more officers dedicated to roadside enforcement as opposed to home visits and incident response, the summer months represent the primary time officers achieve these bonuses. Currently, police quotas are still legal in [24](https://www.fwd.us/wp-content/uploads/2025/06/JAM-Quotas.pdf) states.

```js
// Filter data and used data with new date and time features
const filteredOutcome = updatedRaleighStops.filter(d => {
    if ((d.outcome != "NA") && (d.race != "unknown") && (d.race != "other")) {
      return d
    }
  }
)

// Combine race and outcome
const raceOutcomesCombined = filteredOutcome.map(
 (stop) => {
   stop.race_and_outcome = stop.race + "-" + stop.outcome
   return stop
 }
)

// Group and count by day of year + race and outcome
const outcomeTime = twoLevelRollUpFlatMap(
  raceOutcomesCombined,
  "day_of_year",
  "race_and_outcome",
  "af"
)

// Add normalized counts
const normalizedOutcomeTime = outcomeTime.map(
  (stop) => {
    // Parse out race value in the new combined column
    let raceCheck = getRace(stop.race_and_outcome)
    // Add normalized counts
    stop.normalizedAF = stop.af / raleighPopRatios.get(raceCheck)

    return stop
 }
)
```

```js
// Viewed Inputs need their own scripting blocks
const percBands = view(
  Inputs.range([2, 8], {step: 1, label: "# of Bands for Horizon Chart"})
);
```

```js
const step = d3.max(outcomeTime, (d) => d.normalizedAF) / percBands;
```

```js
// Best to provide Plots their own block too
Plot.plot({
//  height: 720,
 x: {axis: "top"},
 y: {domain: [0, step], axis: null},
 fy: {axis: null, domain: outcomeTime.map((d) => d.race_and_outcome), padding: 0.05},
 color: {
   type: "ordinal",
   scheme: "Greens",
   label: "Rac",
   tickFormat: (i) => ((i + 1) * step).toLocaleString("en"),
   legend: true
 },
 marks: [
   d3.range(percBands).map((band) => Plot.areaY(outcomeTime, {x: "day_of_year", y: (d) => (d.normalizedAF - band * step), fy: "race_and_outcome", fill: band, sort: "day_of_year", clip: true})),
   Plot.axisFy({frameAnchor: "left", dx: -28, fill: "currentColor", textStroke: "white", label: null})
 ]
})
```

## Part 3: Reason For Stop By Outcome and Race
Through an analysis of each of these categories both by frequency and time, we have already started to identify some patterns. Now let's group all three variables and see what findings may emerge. Considering the sheer amount of Vehicle Regulatory and Speed Limit Violations, plus lowered *severity* compared to other reason represented in our dataset, let's focus on these two variables for now.


```js
const filteredReasons = raleighStops.filter(d =>
(d.reason_for_stop == "Vehicle Regulatory Violation" || d.reason_for_stop == "Speed Limit Violation") && d.outcome != "NA")

const raceOutcomeReason = threeLevelRollUpFlatMap(
  filteredReasons,
  "race",
  "outcome",
  "reason_for_stop",
  "af"
)
```
```js
  Plot.plot({
    height: 500,
    width: 1000,
    marginLeft: 60,
    marginBottom: 60,
    fx: {
      label: "Reason for Stop"
    },
    x: {
      label: "Race"
    },
    y: { label: "Count" },
    color: { label: "Outcome",
    field: "outcome",
    legend: true,
    },

    marks: [
      Plot.barY(
        filteredReasons,
        Plot.groupX(
          { y: "count" },
          {
            fx: "reason_for_stop",   
            x: "race",             
            fill: "outcome",
            tooltip: d => ({
            "Reason for Stop": d.reason_for_stop,
            "Race": d.race,
            "Outcome": d.outcome,
          })
          }
        )
      ),
      Plot.ruleY([0])
    ]
  })


```


## Key Findings

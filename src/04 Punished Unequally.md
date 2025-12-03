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
])
```
```js
const raleighStopsByRace = d3.rollups(
  ncPoliceStops,
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
const flatStopsByRace = raleighStopsByRace.flatMap(
  ([race, racesList]) => {
    return racesList
  }
)
```

```js

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

Let's first check the frequency of each stop by race in our dataset.

```js
const afRaceByReason = d3.rollups(
  raleighStops,
  v => v.length,
    d => d.race,
    d => d.reason_for_stop
).flatMap(([race, reasons]) =>
  reasons.map(([reason_for_stop, count]) => ({race, reason_for_stop, count}))
)
//oneLevelRollUpFlatMap was producing different plot
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
      afRaceByReason
       ,
      {
        x: "reason_for_stop",
        y: "count",
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
Next let's examine the Citation_Issued category. This category is divided comprises three categories, including Citation, Warning, and Arrest.. In our dataset the black population is once again overrepresented in each category, particularly when considering Wake County and Raleigh's racial composition.

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
Here we see that black drivers are arrested at a substantially higher clip 



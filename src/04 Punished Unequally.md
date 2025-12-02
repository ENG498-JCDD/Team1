# H3: Punished Unequally: An Outcomes Based Analysis
```js
import {oneLevelRollUpFlatMap,twoLevelRollUpFlatMap,threeLevelRollUpFlatMap,getUniquePropListBy,mapDateObjectForStops} from "./utils/utilsH1.js";
```
## Overview

This chapter provides an in-depth analysis of the outcomes black and white driver's face for traffic stops. It analyzes officer's reason for stopping drivers in conjunction with citations issued, and looks to uncover distinct patterns in the penalties driver's may face for getting pulled over.

This involves three variables in our dataset: race, reason_for_stop, and citation.

**Hypothesis**

Our hypothesis, or h3, is: Black drivers receive harsher outcomes than White drivers for the same violations, with fewer warnings and more arrests. This happens because officers exercise discretion based on race, escalating punishment for Black drivers. Without standardized protocols, discriminatory outcomes will persist, but objective enforcement guidelines can reduce discretionary disparities.

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








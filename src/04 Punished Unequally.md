# H3: Punished Unequally: An Outcomes Based Analysis

## Overview

It has been theorized that, in many instances, black drivers recieve harsher outcomes than white drivers for similar or identical violations at traffic stops. In *Suspect Citizens: What 20 Million Traffic Stops Tell Us About Policing and Race*, Baumgartner et. al extend this theory to North Carolina. Through a comprehensive study of over 20 million traffic stops, the authors find unassailable evidence of racial bias in routine police-citizen interation.

This chapter builds on this finding by applying a similar method of analysis at a more granular level. The previous chapter's have already checked the correlation between race and contraband found between stopped persons. The inclusion of the *reason_for_search* category in this rollup is included to see what correlation, or lack thereof, might be present with motive behind officer stops.

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

There are nine reasons for police stops represented in our dataset.

Vehicle Regulatory Violation
Vehicle Equipment Violation
Stop Light/Sign Violation
Seat Belt Violation
Speed Limit Violation
Safe Movement Violation
Driving While Impaired
Motor Vehicle Violation
Other Motor Vehicle Violation

Let's first check the frequency of each stop by race in our dataset.

```js
Plot.plot({
  width: 1500,
  height: 600,
  title: "Race by Reason for Stop (Absolute Counts)",
  x: {label: "Count"},
  y: {label: "Reason for Stop"},
  grid: true,
  marks: [
    Plot.barX(
      raleighStops,
      Plot.groupY({x: "count", fill: "race"}, {y: "reason_for_stop"})
    ),
    Plot.ruleX([0])
  ]
})
```
```js
Plot.plot({
  width: 1500,
  marks: [
    Plot.barY(raleighStops, { 
      x: "reason_for_stop",
      y: "race",
      fill: "race", 
      sort: { x: "-y" } 
    })
  ]
})
```





Let's first check to see what disparities within races are present for Speed Limit violations, the most represented violation in our dataset.

```js
import {oneLevelRollUpFlatMap} from "./utils/utilsH1.js"

const searchesByStops = raleighStops.filter(
  d => d.reason_for_stop == "Speed Limit Violation"
)

const searchStopsByRace = oneLevelRollUpFlatMap(
  searchesByStops,
  "race",
  "reason_for_stop"
)
```







# 1.2 Creating Groups and Frequency Distributions

## Overview

## Objective
1. Attach the dataset.
2. Present the data in a table.

## Attach the data
```js
const raleighStops = FileAttachment("./../data/nc-stops/raleigh-stops.csv").csv({typed: true});
```

<p class="codeblock-caption">
  Interactive output of full data set in <code>raleighStops</code>
</p>

```js
// Convert to render on page
raleighStops
```

## Review the data as a table
```js
Inputs.table(raleighStops)
```

## Add custom features for `Inputs.table()`

```js
// Insert the table 
Inputs.table(
  // The array of objects
  raleighStops,
  {
    // enter each customizing property in this object
    columns: [
      "subject_race", "subject_sex", "subject_age", "reason_for_stop", "search_conducted", "contraband_found", "raw_action_description"
    ],
    format: {
      id_num: (x) => x.toLocalString(undefined, {useGrouping: false})
    },
    rows: 25,
    width: {
      subject_race: 40,
      subject_sex: 50,
      subject_age: 40,
      reason_for_stop: 180,
      search_conducted: 80,
      contraband_found: 100,
      raw_action_description: 150,
    },
    header: {
      subject_race: "Race",
      subject_sex: "Gender",
      subject_age: "Age",
      reason_for_stop: "Violation",
      search_conducted: "Searched?",
      contraband_found: "Contraband?",
      raw_action_description: "Outcome",
    }
  }
)
```

## Roll it up with .rollup()

```js
const afSearchByRace = d3.rollups(
  raleighStops,
  v => v.length,
  d => d.subject_race,
    d => d.search_conducted
)
```

<p class="codeblock-caption">
  Interactive output of rolled up <code>afSearchByRace</code>:
</p>

```js
afSearchByRace
```

## Flatten that `.rollups()` output with `.flatMap()`

```js
import {oneLevelRollUpFlatMap} from "../components/timeline.js";
```
```js
let byRace = oneLevelRollUpFlatMap(
  raleighStops,
  "subject_race",
  "af"
)
```

<p class="codeblock-caption">
  Interactive output of rolled up <code>byRace</code>:
</p>

```js
byRace
```
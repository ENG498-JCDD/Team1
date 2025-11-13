# H2: EDA Frequency Distribution

```js
import {getUniquePropListBy, oneLevelRollUpFlatMap, twoLevelRollUpFlatMap, threeLevelRollUpFlatMap} from "./utils/utils.js"
```

Enter SQ here. Goals, etc.

## Attach police stop data

```js
const ncPoliceOG = FileAttachment("./../data/updated-nc-stops.csv").csv({typed: true})
```

```js
ncPoliceOG[0]
```

## Add Features: Year, Month, Day of the Week, etc.

Define parsers

```js
const yearFormatter = d3.utcFormat("%Y")
const monthFormatter = d3.utcFormat("%m")
const dayOfWeekFormatter = d3.utcFormat("%A")
```

Add new date features

```js
const ncPoliceUpdated = ncPoliceOG.map(
  (stop) => {
    stop.year = yearFormatter(stop.datetime)
    stop.monthNumber = monthFormatter(stop.datetime)
    stop.dayOfWeek = dayOfWeekFormatter(stop.datetime)

    return stop
  }
)
```

```js
ncPoliceUpdated
```

## Group By Race > Day of the Week


```js
const byRaceAndDayOfWeek = twoLevelRollUpFlatMap(
  ncPoliceUpdated,
  // Level 1 key
  "race",
  // Level 2 key
  "dayOfWeek",
  // Count key
  "af",
)

const byRaceAndYear = twoLevelRollUpFlatMap(
  ncPoliceUpdated,
  // Level 1 key
  "race",
  // Level 2 key
  "year",
  // Count key
  "af",
)
```

## Plot AF: Race > Day of Week

```js
Plot.plot({
  marginLeft: 150,
  legend: true,
  marks: [
    Plot.barY(
      byRaceAndDayOfWeek,
      {
        x: "race",
        y: "af",
        fill: "dayOfWeek",
        sort: {x: "-y"},
        tip: true,
      }
    ),
  ]
})
```

## Plot AF: Race > Year

```js
Plot.plot({
  title: `Stops by race and year`,
  marginLeft: 100,
  marks: [
    Plot.barY(
      byRaceAndYear,
      {
        x: "year",
        y: "af",
        fill: "race",
        fillOpacity: 0.95,
        tip: true,
      }
    ),
  ]
})
```

## Plot: Frequency Distribution Race>Year

```js
const raceSelection1 = view(
  Inputs.select(
    ncPoliceUpdated.map(d => d.race),
    {
      unique: true,
      label: "Select race value(s):",
      multiple: false,
      value: "white",
    }
  )
)
const raceSelection2 = view(
  Inputs.select(
    ncPoliceUpdated.map(d => d.race),
    {
      unique: true,
      label: "Select race value(s):",
      multiple: false,
      value: "black",
    }
  )
)

const interval = 1000
```

```js
Plot.plot({
  title: `Frequency distribution of stops for ${raceSelection1} and ${raceSelection2} (interval=${interval})`,
  y: {grid: true},
  color: {
    legend: true,
    scheme: "Tableau10",
  },
  marks: [
    Plot.ruleY([0]),

    // Selection 1
    Plot.rectY(
      byRaceAndYear.filter(d => d.race == raceSelection1),
      Plot.binX(
        {y: "count"},
        {x: "af", interval: interval, fill: "red"}
      )
    ),
    // Avg mean length
    Plot.ruleX(
      [d3.mean(byRaceAndYear.filter(d => d.race == raceSelection1), d => d.af)],
      {
        strokeWidth: 3,
        stroke: "red",
      }
    ),

    // Selection 2
    Plot.rectY(
      byRaceAndYear.filter(d => d.race == raceSelection2),
      Plot.binX(
        {y: "count"},
        {x: "af", interval: interval, fill: "black",}
      )
    ),
    // Avg mean length
    Plot.ruleX(
      [d3.mean(byRaceAndYear.filter(d => d.race == raceSelection2), d => d.af)],
      {
        strokeWidth: 3,
        stroke: "black",
      }
    ),
  ]
})
```
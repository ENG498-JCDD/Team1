```js
import {oneLevelRollUpFlatMap,twoLevelRollUpFlatMap,threeLevelRollUpFlatMap,getUniquePropListBy,mapDateObjectForStops} from "./utils/utilsH1.js";
```

# Racial Disparities in Traffic Stops and Searches
## A Data-Driven Analysis of Raleigh, NC (2011 to 2015)

## Overview

Do Black drivers experience discriminatory treatment during traffic stops in Raleigh, NC? This analysis examines five years of traffic stop data to answer that question through multiple dimensions.

**What we examine:**
1. Stop patterns by race compared to population demographics.
2. Search rates and types of searches conducted.
3. Contraband discovery rates and the "outcome test" for discrimination.

**Our framework:** If Black drivers are stopped and searched more frequently but contraband is found at similar or lower rates, this suggests racial profiling rather than evidence-based policing. However, we must also examine whether higher contraband discovery rates proportionally justify higher search rates.

## Research Question

Do Black drivers experience disproportionate stop and search rates compared to White drivers in Raleigh? And if so, are these disparities justified by contraband discovery patterns?

## Loading the Data

Let's examine the data first.

```js
const raleighStops = FileAttachment("./data/policestops-with-townships.csv").csv({typed: true});
```

<p class="codeblock-caption">
  Interactive output of full data set in <code>raleighStops</code>
</p>

```js
raleighStops
```
## Part 1: Understanding Our Dataset by Race

### The Central Question

When examining traffic stop data, the most fundamental question we must ask is whether all drivers are being stopped at equal rates, or if race plays a role in who gets stopped.

To answer this question fairly, we cannot simply count how many drivers of each race were stopped. We must first understand Raleigh's population composition. If policing is unbiased, we would expect traffic stops to roughly mirror the demographic makeup of the city. In other words, if a racial group makes up 30% of the population, they should account for approximately 30% of traffic stops, not 50%, and not 10%.

This section establishes our demographic baseline and examines whether traffic stop patterns align with population proportions.

### Building Our Baseline

First, let's establish what Raleigh's population actually looks like during our study period (2011 to 2015). We'll use official U.S. Census data that covers this exact timeframe.
```js
const stopsByRace = oneLevelRollUpFlatMap(
  raleighStops,
  "race",
  "count"
)
```
```js
// Calculate total stops and add percentages
const totalStops = d3.sum(stopsByRace, d => d.count)

const stopsByRaceWithPercent = []

for (const row of stopsByRace) {
  const percentage = (row.count / totalStops) * 100
  
  stopsByRaceWithPercent.push({
    race: row.race,
    count: row.count,
    percentage: percentage
  })
}
```
```js
// Raleigh, NC Population by Race (2011 to 2015 ACS 5 Year Estimates)
// Source: U.S. Census Bureau, Table DP05
// Link: https://data.census.gov/table/ACSDP5Y2015.DP05?q=Raleigh+city,+North+Carolina
const raleighPopulationByRace = [
  {race: "white", population: 260263, percentage: 60.2},
  {race: "black", population: 126558, percentage: 29.3},
  {race: "asian/pacific islander", population: 19115, percentage: 4.4},
  {race: "hispanic", population: 15191, percentage: 3.5},
  {race: "other", population: 9784, percentage: 2.3}
]
```

### The Disparity Revealed

Now comes the critical comparison. The visuals below show Raleigh's population by race on the left, and the racial breakdown of traffic stops on the right. If policing were proportional and unbiased, these two charts should look nearly identical.

Do they?
```js
// First plot for Population
const populationPlot = Plot.plot({
  title: "Raleigh Population by Race (2011-2015)",
  width: 600,
  height: 500,
  marginLeft: 100,
  marginBottom: 80,
  grid: true,
  
  x: {
    label: "Race",
    padding: 0.2
  },
  
  y: {
    label: "Percentage of Population",
    domain: [0, 65],
    grid: true
  },
  
  color: {
    legend: true,
    scheme: "tableau10"
  },
  
  marks: [
    Plot.ruleY([0]),
    
    Plot.barY(raleighPopulationByRace, {
      x: "race",
      y: "percentage",
      fill: "race",
      sort: {x: "-y"},
      tip: true
    }),
    
    Plot.text(raleighPopulationByRace, {
      x: "race",
      y: "percentage",
      text: d => `${d.percentage.toFixed(1)}%`,
      dy: -10,
      fontSize: 14,
      fontWeight: "bold"
    })
  ]
})
```
```js
// Second plot for Traffic Stops
const trafficStopsPlot = Plot.plot({
  title: "Traffic Stops by Race (2011-2015)",
  width: 600,
  height: 500,
  marginLeft: 100,
  marginBottom: 80,
  grid: true,
  
  x: {
    label: "Race",
    padding: 0.2
  },
  
  y: {
    label: "Percentage of Stops",
    domain: [0, 65],
    grid: true
  },
  
  color: {
    legend: true,
    scheme: "tableau10"
  },
  
  marks: [
    Plot.ruleY([0]),
    
    Plot.barY(stopsByRaceWithPercent, {
      x: "race",
      y: "percentage",
      fill: "race",
      sort: {x: "-y"},
      tip: true
    }),
    
    Plot.text(stopsByRaceWithPercent, {
      x: "race",
      y: "percentage",
      text: d => `${d.percentage.toFixed(1)}%`,
      dy: -10,
      fontSize: 14,
      fontWeight: "bold"
    })
  ]
})
```

<div class="grid grid-cols-2">
  <div class="card">
    ${populationPlot}
  </div>
  <div class="card">
    ${trafficStopsPlot}
  </div>
</div>

### Understanding the Numbers

The side by side comparison reveals a stark disparity:

 - White drivers make up **60.2%** of the population but only **40.8%** of traffic stops 
 - While Black drivers represent **29.3%** of the population yet account for **48.8%** of stops. 
 
 This means Black drivers are stopped at **1.66x** times their population proportion.

Black drivers in Raleigh are 66% more likely to be stopped than random chance would predict, while White drivers are 32% less likely to be stopped, a whopping 38.9 percentage point difference. This initial issue raises questions about whether race influences policing decisions.

### Testing for Consistency

One hypothesis could be that this disparity is a recent anomaly, perhaps the result of changes in a single year or short term policing strategies. To test this, we need to examine whether the racial disparity we observed is consistent across all five years in our dataset, or whether it varies significantly from year to year.

```js
const stopsWithDates = mapDateObjectForStops(raleighStops, "datetime")

const stops2011to2015 = stopsWithDates.filter(
  d => d.datetime_year >= 2011 && d.datetime_year <= 2015
)

const stopsByYearRace = twoLevelRollUpFlatMap(
  stops2011to2015,
  "datetime_year",
  "race",
  "count"
)

const stopsByYearRaceString = []

for (const row of stopsByYearRace) {
  stopsByYearRaceString.push({
    datetime_year: String(row.datetime_year),  
    race: row.race,
    count: row.count
  })
}
```
```js
Plot.plot({
  title: "Traffic Stops by Race Over Time (2011-2015)",
  width: 1000,
  height: 500,
  marginLeft: 80,
  marginRight: 270,
  marginBottom: 40,
  grid: true,
  
  x: {
    label: "Year"
  },
  
  y: {
    label: "Number of Stops",
    grid: true
  },
  
  color: {
    legend: true,
    scheme: "category10"
  },
  
  marks: [
    Plot.lineY(stopsByYearRaceString, {
      x: "datetime_year",
      y: "count",
      stroke: "race",
      strokeWidth: 3,
      marker: "circle",
      tip: true
    }),
    
    Plot.ruleY([0])
  ]
})
```

The time series highlights a crucial insight: racial disparities in traffic stops are stable and persistent. Across the entire 2011–2015 period, Black drivers consistently faced the highest number of stops.


All racial groups followed similar overall trends, a decline from 2011 to 2013, followed by an increase through 2015. Yet the gap between Black and white drivers never closed.

 This consistency shows that the disparity is not a temporary anomaly or the result of a single unusual year. *Instead, it reflects a structural pattern embedded in Raleigh’s traffic stop practices as a whole*.


### What This Means

We've now established three critical findings:

First, Black drivers are stopped at rates far exceeding their population share (**48.8%** of stops versus **29.3%** of population).

Second, White drivers are stopped at rates below their population share (**40.8%** of stops versus **60.2%** of population).

Third, this pattern is consistent across all five years in our dataset, meaning this is a systemic issue rather than a problem arising randomly.

But being stopped more frequently is only one dimension of the story. The next critical question is whether Black and White drivers are treated differently once they are stopped. Specifically, are Black drivers more likely to be searched? And if so, do these searches yield contraband at rates that would justify the disparity?

That's what we'll examine next.

## Part 2: Search Rates by Race

Now, let's investigate the key question: Are Black drivers searched at higher rates than White drivers?

This matters because taking actions to search either a vehicle or someone's person is an entirely different situation, both figuratively and data-wise. Let's explore how to calculate and sort through these instances of privacy breach.

### Calculating Search Rates

First, let's count how many searches were conducted for each racial group and calculate the search rate (the percentage of stops that resulted in a search).
```js
const searchesByRace = raleighStops.filter(
  d => d.search_conducted == "TRUE"
)

const searchCountsByRace = oneLevelRollUpFlatMap(
  searchesByRace,
  "race",
  "search_count"
)
```
```js
// Calculate search rates (searches as percentage of total stops for each race)
const searchRatesByRace = []

for (const raceRow of stopsByRace) {
  const raceName = raceRow.race
  const totalStopsForRace = raceRow.count
  
  // Find how many searches for this race
  let searchesForRace = 0
  for (const searchRow of searchCountsByRace) {
    if (searchRow.race == raceName) {
      searchesForRace = searchRow.search_count
    }
  }
  
  // Calculate search rate
  const searchRate = (searchesForRace / totalStopsForRace) * 100
  
  searchRatesByRace.push({
    race: raceName,
    total_stops: totalStopsForRace,
    searches: searchesForRace,
    search_rate: searchRate
  })
}
```

### The Search Disparity

The visualization below shows what percentage of traffic stops resulted in a search for each racial group. If searches were conducted without racial bias, we would expect these rates to be similar across all groups.
```js
Plot.plot({
  title: "Search Rate by Race (2011 to 2015)",
  width: 900,
  height: 500,
  marginLeft: 60,
  marginRight: 270,
  marginBottom: 50,
  grid: true,
  
  x: {
    label: "Race",
    padding: 0.3
  },
  
  y: {
    label: "Search Rate (% of stops resulting in search)",
    domain: [0, 6],
    grid: true
  },
  
  color: {
    legend: true,
    scheme: "tableau10"
  },
  
  marks: [
    Plot.ruleY([0]),
    
    Plot.barY(searchRatesByRace, {
      x: "race",
      y: "search_rate",
      fill: "race",
      sort: {x: "-y"},
      tip: true
    }),
    
    Plot.text(searchRatesByRace, {
      x: "race",
      y: "search_rate",
      text: d => `${d.search_rate.toFixed(1)}%`,
      dy: -10,
      fontSize: 14,
      fontWeight: "bold"
    })
  ]
})
```

**Critical Finding**

The chart reveals a clear pattern in how different racial groups are treated once stopped. Black drivers are searched at a rate of 4.6%, while White drivers are searched at only 2.1%. This means Black drivers are **2.2x more likely** to be searched than White drivers during a traffic stop.

To put this in context, remember from Part 1 that Black drivers already experience disproportionate stop rates (**48.8%** of stops despite being **29.3%** of the population). Now we see a second layer of disparity. Even after being stopped, Black drivers face more than double the search rate of White drivers.

While the "other" category shows a higher search rate at **5.1%**, this represents only a small number of stops (**2.3%** of all stops), making it less statistically significant for our analysis. 

The comparison between Black and White drivers, representing the vast majority of stops in our dataset, provides the most meaningful insight into racial disparities in search practices.

### Breaking Down Search Types

There are two types of searches officers can conduct; a vehicle search or a search on the driver's person. Is the racial disparity consistent across both search types?
```js
const racePersonSearch = twoLevelRollUpFlatMap(
  raleighStops,
  "race",
  "search_person",
  "count"
)
```
```js
const raceVehicleSearch = twoLevelRollUpFlatMap(
  raleighStops,
  "race",
  "search_vehicle",
  "count"
)
```
```js
// Prepare data for grouped chart
const searchTypesByRace = []

for (const raceRow of stopsByRace) {
  const raceName = raceRow.race
  const totalStopsForRace = raceRow.count
  
  // Get person search count
  let personSearchesTrue = 0
  for (const searchRow of racePersonSearch) {
    if (searchRow.race == raceName && searchRow.search_person == "TRUE") {
      personSearchesTrue = searchRow.count
    }
  }
  
  // Get vehicle search count
  let vehicleSearchesTrue = 0
  for (const searchRow of raceVehicleSearch) {
    if (searchRow.race == raceName && searchRow.search_vehicle == "TRUE") {
      vehicleSearchesTrue = searchRow.count
    }
  }
  
  const personRate = (personSearchesTrue / totalStopsForRace) * 100
  const vehicleRate = (vehicleSearchesTrue / totalStopsForRace) * 100
  
  // Add person search row
  searchTypesByRace.push({
    race: raceName,
    search_type: "Person Search",
    search_rate: personRate
  })
  
  // Add vehicle search row
  searchTypesByRace.push({
    race: raceName,
    search_type: "Vehicle Search",
    search_rate: vehicleRate
  })
}
```
```js
Plot.plot({
  title: "Person vs Vehicle Search Rates by Race (2011 to 2015)",
  width: 1000,
  height: 500,
  marginLeft: 120,
  marginRight: 270,
  marginBottom: 50,
  grid: true,
  
  x: {
    label: "Search Rate (%)",
    labelAnchor: "center",
    domain: [0, 5],
    grid: true
  },
  
  y: {
    label: "Race"
  },
  
  color: {
    legend: true,
    domain: ["Person Search", "Vehicle Search"],
    range: ["#e15759", "#4e79a7"]
  },
  
  marks: [
    Plot.ruleX([0]),
    
    // Dots for each search type
    Plot.dot(searchTypesByRace, {
      x: "search_rate",
      y: "race",
      fill: "search_type",
      r: 8,
      tip: true
    }),
    
    // Lines connecting person to vehicle searches
    Plot.link(
      searchTypesByRace.filter(d => d.search_type == "Person Search"),
      {
        x1: d => {
          const vehicleRow = searchTypesByRace.find(
            row => row.race == d.race && row.search_type == "Vehicle Search"
          )
          return vehicleRow ? vehicleRow.search_rate : d.search_rate
        },
        x2: "search_rate",
        y1: "race",
        y2: "race",
        stroke: "#ccc",
        strokeWidth: 2
      }
    )
  ]
})
```

**Key Observation**

Here, the Black drivers appear at the far right of the plot dot chart, experiencing the highest search rates for both person searches (red dot at **4.36%**) and vehicle searches (blue dot at **3.75%**). White drivers, by contrast, cluster much closer to the left side of the chart, with significantly lower rates for both person searches (**1.95%**) and vehicle searches (**1.58%**).

Take note of an important detail across all racial groups. The red dots (person searches) consistently appear to the right of the blue dots (vehicle searches). 

This tells us that person searches happen *more frequently* than vehicle searches across the board. However, what matters most is not just this pattern, but the dramatic difference in where each racial group falls on the horizontal axis.

The gray lines connecting each pair of dots show the gap between person and vehicle search rates for each racial group. Black drivers experience person searches at a rate **2.2x** higher than White drivers (**4.36% vs 1.95%**), and vehicle searches at a rate **2.4x** higher (**3.75% vs 1.58%**). 

This visualization makes the disparity unmistakable. The horizontal spread of the dots shows that not all drivers face equal treatment during traffic stops. Black drivers consistently appear on the right side of the spectrum (higher search rates), while White drivers consistently appear on the left (lower search rates). This pattern holds true for both the more invasive person searches and vehicle searches.

The "other" category shows the highest person search rate, but as discussed earlier, this represents only **2.3%** of all stops in our dataset, making it less statistically meaningful. The comparison between Black and White drivers, representing the vast majority of traffic stops, provides the clearest evidence of systematic racial disparity in search practices.

### What This Means

Black drivers face a compounding disparity. Black drivers are stopped more frequently and are searched more frequently at a **2.2x** higher rate than White drivers.

## Part 3: Contraband Discovery Analysis

So far, our analysis found that Black drivers are searched at significantly higher rates than White drivers.

 Now, here comes a critical question. When Black drivers are searched, is contraband actually found more often?

The logic behind this is simple. If searches are based on legitimate evidence, then higher search rates should correlate with higher contraband discovery rates. However, if searches are based on racial bias, then we might see higher search rates paired with similar or lower contraband discovery rates, suggesting searches lack proper justification.

### Calculating Discovery Rates

To answer this question, we need to examine the contraband discovery patterns. We'll use a three level rollup that groups our data by race, search conducted, and contraband found. This will allow us to see, for each racial group, how many searches were conducted and how many of those searches actually resulted in finding contraband.
```js
const stopsWithContrabandData = raleighStops.filter(
  d => d.contraband_found != "NA"
)

const raceSearchContraband = threeLevelRollUpFlatMap(
  stopsWithContrabandData,
  "race",
  "search_conducted",
  "contraband_found",
  "count"
)
```
```js
// Reducer function for contraband FOUND
// Returns count if contraband was found, else 0
const contrabandFoundReducer = (d) => {
  if (d.contraband_found == "TRUE" && d.search_conducted == "TRUE") {
    return d.count
  }
  else {
    return 0
  }
}

// Reducer function for contraband NOT FOUND
// Returns count if contraband was NOT found, else 0
const contrabandNotFoundReducer = (d) => {
  if (d.contraband_found == "FALSE" && d.search_conducted == "TRUE") {
    return d.count
  }
  else {
    return 0
  }
}
```
```js
// Get all unique races from the data
const uniqueRaceList = getUniquePropListBy(
  raceSearchContraband,
  "race"
)

// Reducer functions objectified
const reducerFuncs = [
  {
    type: "FOUND",
    func: contrabandFoundReducer
  },
  {
    type: "NOT_FOUND",
    func: contrabandNotFoundReducer
  }
]
```
```js
// Create array for results
const contrabandPercResults = []

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
```js
// Filter for contraband FOUND only (hit rates)
const hitRatesByRace = contrabandPercResults.filter(
  d => d.contraband_status == "FOUND"
)

// Convert to percentages for visualization
const hitRatesForPlot = []
for (const row of hitRatesByRace) {
  hitRatesForPlot.push({
    race: row.race,
    hit_rate: row.percentage * 100,
    total_searches: row.total_searches,
    contraband_found: row.count
  })
}
```

### The Outcome Test

Now let's compare search rates from Part 2 with the contraband discovery rates (hit rates) we just calculated. If searches are based on legitimate evidence, these two metrics should move together proportionally.
```js
// Extract search rates for Black and White from Part 2
const blackSearchRate = searchRatesByRace.find(d => d.race == "black").search_rate
const whiteSearchRate = searchRatesByRace.find(d => d.race == "white").search_rate


const blackHitRate = hitRatesForPlot.find(d => d.race == "black").hit_rate
const whiteHitRate = hitRatesForPlot.find(d => d.race == "white").hit_rate

// Create comparison data dynamically
const comparisonData = [
  {race: "Black", metric: "Search Rate", value: blackSearchRate},
  {race: "Black", metric: "Hit Rate", value: blackHitRate},
  {race: "White", metric: "Search Rate", value: whiteSearchRate},
  {race: "White", metric: "Hit Rate", value: whiteHitRate}
]
```
```js
Plot.plot({
  title: "Search Rate vs Hit Rate (Black vs White Drivers, 2011 to 2015)",
  width: 700,
  height: 400,
  marginLeft: 80,
  marginBottom: 60,
  marginRight: 250,
  grid: true,
  
  x: {
    label: "",
    domain: ["Search Rate", "Hit Rate"]
  },
  
  y: {
    label: "Percentage (%)",
    domain: [0, 22],
    grid: true
  },
  
  color: {
    legend: true,
    domain: ["Black", "White"],
    range: ["#ff7f0e", "#1f77b4"]
  },
  
  marks: [
    Plot.ruleY([0]),
    
    // Gray lines connecting the points for each race
    Plot.line(comparisonData, {
      x: "metric",
      y: "value",
      z: "race",
      stroke: "#ccc",  // Gray color for lines
      strokeWidth: 2
    }),
    
    // Colored dots at each point with tooltips
    Plot.dot(comparisonData, {
      x: "metric",
      y: "value",
      fill: d => d.race == "Black" ? "#ff7f0e" : "#1f77b4",  // Explicit colors
      r: 6,
      tip: true,
      title: d => `${d.race}: ${d.value.toFixed(1)}%`
    })
  ]
})
```

**Key Finding**

The visualization reveals a critical mismatch between search rates and contraband discovery rates. Black drivers show a hit rate of ${blackHitRate.toFixed(1)}%, while White drivers show ${whiteHitRate.toFixed(1)}%, meaning contraband is found 1.3 times more often when Black drivers are searched. However, recall from Part 2 that Black drivers are searched at ${blackSearchRate.toFixed(1)}% compared to White drivers at ${whiteSearchRate.toFixed(1)}%, representing a 2.2 times higher search rate.


If searches were truly evidence based and unbiased, these two ratios should align. The fact that Black drivers are searched 2.2 times more often but their hit rate is only 1.3 times higher suggests that the threshold for conducting searches is lower for Black drivers. Officers appear more willing to search Black drivers based on weaker evidence, leading to more searches overall but not proportionally more contraband discoveries. This is what policing researchers call the "outcome test" for discrimination. When a group is searched more frequently but shows only modestly higher hit rates, it indicates those searches are less justified on average.
The data tells a clear story. The 2.2x search rate disparity far exceeds the 1.3x hit rate disparity, providing strong evidence that racial bias, not legitimate law enforcement concerns, drives who gets searched during traffic stops in Raleigh.
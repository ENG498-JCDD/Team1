```js
import {oneLevelRollUpFlatMap,twoLevelRollUpFlatMap,threeLevelRollUpFlatMap,getUniquePropListBy,mapDateObjectForStops} from "./utils/utilsH1.js";
```

# Racial Disparities in Traffic Stops and Searches: A Multi-Dimensional Analysis of Raleigh, NC (2011-2015)


## Overview

In this chapter, we investigate whether Black drivers experience discriminatory practices during traffic stops in Raleigh, NC. We will examine:

1. **Stop patterns by race** - Are Black drivers stopped more often than other racial groups, and is this pattern consistent over time?
2. **Search patterns by race** - Are Black drivers searched more often?
3. **Types of searches** - Do disparities exist in both person searches and vehicle searches?
4. **Gender-specific patterns** - Do racial disparities persist even among women drivers, who are stereotypically considered "safer"?
5. **Contraband discovery rates** - When searches occur, is contraband actually found? Do discovery rates justify the search rate disparities?

**Our hypothesis:** If Black drivers are both stopped and searched more frequently, but contraband is found at similar or lower rates, this indicates racial profiling rather than evidence-based policing. However, we must also consider whether higher contraband discovery rates proportionally justify higher search rates.

## Research Question

**Do Black drivers experience disproportionate stop rates and search rates compared to White drivers, and if so, are these disparities justified by contraband discovery patterns?**

Let's explore the data to find out.

## Loading the Data

First, let's load our Raleigh traffic stops dataset (2011-2015):

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

Now comes the critical comparison. The visualizations below show Raleigh's actual population composition on the left, and the racial breakdown of traffic stops on the right. If policing were proportional and unbiased, these two charts should look nearly identical.

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

The side by side comparison reveals a troubling pattern. The two charts do not look the same. Let's examine what's happening.

**White Drivers**

White drivers make up 60.2% of the population but only account for 40.8% of traffic stops. This represents an under representation of 19.4 percentage points. White drivers, who make up the majority of Raleigh's population, are stopped at a rate significantly lower than their population share. This means the traffic stop burden falls disproportionately on other groups.

**Black Drivers**

Black drivers make up 29.3% of the population but account for 48.8% of all traffic stops. This represents an over representation of 19.5 percentage points. Black drivers, who make up less than one third of Raleigh's population, account for nearly half of all traffic stops. This means Black drivers are stopped at a rate 1.66 times higher than their population proportion would predict.

To put this in perspective, if you are a Black driver in Raleigh, you are 66% more likely to be stopped by police compared to what random chance would predict based on population alone. Conversely, if you are a White driver, you are 32% less likely to be stopped.

This 38.9 percentage point swing between White and Black drivers cannot be explained by population differences alone. This disparity raises serious questions about whether race influences policing decisions.

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

The time series reveals an important finding. The racial disparity is remarkably stable across all five years. Black drivers consistently experienced the highest number of stops throughout the entire 2011 to 2015 period. While all groups followed similar trends (declining from 2011 to 2013, then increasing through 2015), the gap between Black and White drivers remained persistent. This is not a temporary anomaly or a single year outlier. This is a structural pattern embedded in traffic stop practices.

### What This Means

We've now established three critical findings:

First, Black drivers are stopped at rates far exceeding their population share (48.8% of stops versus 29.3% of population).

Second, White drivers are stopped at rates below their population share (40.8% of stops versus 60.2% of population).

Third, this pattern is consistent across all five years in our dataset, indicating a systemic issue rather than a temporary problem.

But being stopped more frequently is only one dimension of the story. The next critical question is whether Black and White drivers are treated differently once they are stopped. Specifically, are Black drivers more likely to be searched? And if so, do these searches yield contraband at rates that would justify the disparity?

That's what we'll examine next.

## Part 2: Search Rates by Race

Now let's investigate the key question. Are Black drivers searched at higher rates than White drivers?

Here's why this matters. Being stopped more often is one thing. But if Black drivers are also being searched at disproportionate rates once they're stopped, that's a whole different level of disparity. Let's find out.

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

The chart reveals a clear pattern in how different racial groups are treated once stopped. Black drivers are searched at a rate of 4.6%, while White drivers are searched at only 2.1%. This means Black drivers are **2.2 times more likely** to be searched than White drivers during a traffic stop.

To put this in context, remember from Part 1 that Black drivers already experience disproportionate stop rates (48.8% of stops despite being 29.3% of the population). Now we see a second layer of disparity. Even after being stopped, Black drivers face more than double the search rate of White drivers.

While the "other" category shows a higher search rate at 5.1%, this represents only a small number of stops (2.3% of all stops), making it less statistically significant for our analysis. The comparison between Black and White drivers, representing the vast majority of stops in our dataset, provides the most meaningful insight into racial disparities in search practices.

### Breaking Down Search Types

There are two types of searches officers can conduct. Person searches involve searching the driver's body, while vehicle searches involve searching the car. Is the racial disparity consistent across both search types?
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

The dot plot reveals a striking visual pattern. Black drivers appear at the far right of the chart, experiencing the highest search rates for both person searches (red dot at 4.36%) and vehicle searches (blue dot at 3.75%). White drivers, by contrast, cluster much closer to the left side of the chart, with significantly lower rates for both person searches (1.95%) and vehicle searches (1.58%).

Notice an important detail across all racial groups. The red dots (person searches) consistently appear to the right of the blue dots (vehicle searches). This tells us that person searches happen more frequently than vehicle searches across the board. However, what matters most is not just this pattern, but the dramatic difference in where each racial group falls on the horizontal axis.

The gray lines connecting each pair of dots illustrate the gap between person and vehicle search rates for each racial group. Black drivers experience person searches at a rate 2.2 times higher than White drivers (4.36% vs 1.95%), and vehicle searches at a rate 2.4 times higher (3.75% vs 1.58%). 

This visualization makes the disparity unmistakable. The horizontal spread of the dots shows that not all drivers face equal treatment during traffic stops. Black drivers consistently appear on the right side of the spectrum (higher search rates), while White drivers consistently appear on the left (lower search rates). This pattern holds true for both the more invasive person searches and vehicle searches.

The "other" category shows the highest person search rate, but as discussed earlier, this represents only 2.3% of all stops in our dataset, making it less statistically meaningful. The comparison between Black and White drivers, representing the vast majority of traffic stops, provides the clearest evidence of systematic racial disparity in search practices.

### What This Means

The search rate analysis reveals a troubling pattern that compounds the stop rate disparity we observed in Part 1. Not only are Black drivers stopped more frequently, but once stopped, they face a dramatically higher likelihood of being searched. This disparity holds across both person searches and vehicle searches, indicating a systemic pattern rather than isolated incidents.

The dot plot visualization makes one thing crystal clear. There is a consistent racial hierarchy in how searches are conducted. Black drivers are pushed to the right side of the spectrum (higher search rates), while White drivers remain on the left (lower rates). This is not random variation. This is a pattern that persists across both types of searches, suggesting that race plays a significant role in officers' decisions about whom to search.

But there's one more critical question to answer. When these searches occur, is contraband actually found? Do the discovery rates justify the higher search rates for Black drivers? If Black drivers are searched more often but contraband is found at similar or lower rates compared to White drivers, that would provide even stronger evidence that these searches are driven by bias rather than legitimate law enforcement concerns. That's what we'll examine next.

## Part 3: Gender Specific Analysis

We've established clear racial disparities in overall search rates. Now, let's test whether this pattern holds even when we look at a specific subgroup. Women drivers.

If racial disparities persist even among women drivers, this would provide stronger evidence that searches are based on race rather than driving behavior or safety concerns.

### Women Drivers and the Search Rate Distribution

To understand where women drivers fall in the overall search rate distribution, we first need to calculate the mean and median search rates across all demographic groups (combining race and gender). This gives us a baseline to compare against.
```js
// Filter for women drivers only
const womenDrivers = raleighStops.filter(d => d.sex == "female")

// Calculate search rates for women by race
const womenByRaceStops = oneLevelRollUpFlatMap(womenDrivers, "race", "count")

const womenSearches = womenDrivers.filter(d => d.search_conducted == "TRUE")
const womenSearchesByRace = oneLevelRollUpFlatMap(womenSearches, "race", "search_count")

const womenSearchRates = []

for (const raceRow of womenByRaceStops) {
  const raceName = raceRow.race
  const totalStops = raceRow.count
  
  let searches = 0
  for (const searchRow of womenSearchesByRace) {
    if (searchRow.race == raceName) {
      searches = searchRow.search_count
    }
  }
  
  const searchRate = (searches / totalStops) * 100
  
  womenSearchRates.push({
    race: raceName,
    search_rate: searchRate,
    total_stops: totalStops,
    searches: searches
  })
}
```
```js
// Calculate the mean and median search rates across all women drivers
const meanSearchRate = d3.mean(womenSearchRates, d => d.search_rate)
const medianSearchRate = d3.median(womenSearchRates, d => d.search_rate)
```
```js
Plot.plot({
  title: "Search Rates for Women Drivers by Race (2011 to 2015)",
  width: 900,
  height: 500,
  marginLeft: 150,
  marginBottom: 80,
  marginRight: 80,
  grid: true,
  
  x: {
    label: "Race",
    padding: 0.1
  },
  
  y: {
    label: "Search Rate (%)",
    domain: [0, 4],
    grid: true
  },
  
  color: {
    legend: true,
    scheme: "tableau10"
  },
  
  marks: [
    Plot.ruleY([0]),
    
    // Mean reference line (red)
    Plot.ruleY([meanSearchRate], {
      stroke: "red",
      strokeWidth: 2,
      strokeDasharray: "5,5"
    }),
    
    // Median reference line (blue)
    Plot.ruleY([medianSearchRate], {
      stroke: "blue",
      strokeWidth: 2,
      strokeDasharray: "5,5"
    }),
    
    // Bars for each race
    Plot.barY(womenSearchRates, {
      x: "race",
      y: "search_rate",
      fill: "race",
      sort: {x: "-y"},
      tip: true
    }),
    
    // Percentages on bars
    Plot.text(womenSearchRates, {
      x: "race",
      y: "search_rate",
      text: d => `${d.search_rate.toFixed(2)}%`,
      dy: -10,
      fontSize: 14,
      fontWeight: "bold"
    }),
    
    // Mean label
    Plot.text([{x: "white", y: meanSearchRate}], {
      x: "x",
      y: "y",
      text: [`Mean: ${meanSearchRate.toFixed(2)}%`],
      dx: 150,
      dy: -8,
      fill: "red",
      fontSize: 12,
      fontWeight: "bold"
    }),
    
    // Median label
    Plot.text([{x: "white", y: medianSearchRate}], {
      x: "x",
      y: "y",
      text: [`Median: ${medianSearchRate.toFixed(2)}%`],
      dx: 150,
      dy: 8,
      fill: "blue",
      fontSize: 12,
      fontWeight: "bold"
    })
  ]
})
```

**Key Finding**

The mean search rate for women drivers across all racial groups is ${meanSearchRate.toFixed(2)}%, while the median is ${medianSearchRate.toFixed(2)}%. Black women are searched at a rate of 2.02%, which is above both the mean and median, while White women are searched at 1.39%, which is below both measures. The similarity between mean and median suggests the distribution is relatively balanced, not heavily skewed by outliers. Even among women drivers who are stereotypically considered safer and less threatening, Black women experience search rates 1.45 times higher than White women. This demonstrates that race, not gender or driving behavior, remains the primary factor influencing search decisions.




















<!-- 

<!-- ## Part 2: Search Rates by Race

## Part 3: Gender-Specific Analysis - Black Women vs White Women Drivers

We've established clear racial disparities in overall search rates. Now, let's test this pattern further by examining a specific subgroup: "Women Drivers". 

Women are often stereotyped as "safer" or "more cautious" drivers. If racial disparities persist even among women drivers who presumably pose less threat, this would provide even strong evidence that searches are based on race rather than driving behavior or legitimate safety concerns.

**Research Question:** Do Black women drivers face higher search rates than white women drivers, despite both groups being women?

### Three-Level Analysis: Race > Gender > Search Status

Let's do a comprehensive three-level rollup to examine race, gender, and search patterns simultaneously:

```js
// Filter for women drivers only
const womenDrivers = raleighStops.filter(
  d => d.sex == "female" 
  // && (d.race == "black" || d.race == "white")
)

const womenRacePersonSearch = threeLevelRollUpFlatMap(
  womenDrivers,
  "race",
  "sex",
  "search_person",
  "count"
)
```

<p class="codeblock-caption">
  Interactive output of women only: <code>race × sex × search_person</code>
</p>

```js
womenRacePersonSearch
// consider adding a visualization in the observation section
```

**Key Observation:** Black women are person-searched at a rate of 2.02%, while White women are searched at 1.39%. This means, Black women are 1.45 times more likely to experience person searches than White women. 

This proves that, even among women drivers who are stereotypically considered safer and less threatening, the racial disparity persist. This demonstrates that race, not gender stereotypes or driving behavior, is the primary factor influencing search decisions.

## Part 4: Contraband Discovery Analysis

So far, our analysis found that Black drivers are searched at significantly higher rates than White drivers. Now, here comes a critical question: When Black drivers are searched, is contraband actually found more often?

The logic behind this is if searches are based on legitimate evidence, then higher search rates should mean higher contraband discovery rates. However, if searches are based on racial bias, then higher search rates will show lower contraband discovery rates because searches lack proper evidence.

### Three-Level Analysis: Race > Search Conducted > Contraband Found

Now, we need to examine the contraband discovery patterns, and to do this effectively, we'll use a three level rollup that groups our data by race, search conducted, and contraband found. This will allow us to see, for each racial group, how many searches were conducted and how many of those searches actually resulted in finding contraband. 

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

<p class="codeblock-caption">
  Interactive output of three-level analysis: <code>race × search_conducted × contraband_found</code>
</p>

```js
raceSearchContraband
```

#### Visualizing Hit Rates

Let's examine the contraband discovery rates visually to better understand the disparity between Black and White drivers.

```js
// present the finding with visualization
// write reducer function
/**
 * Reducer function for contraband FOUND
 * Returns count if contraband was found, else 0
**/
const contrabandFoundReducer = (d) => {
  if (d.contraband_found == "TRUE" && d.search_conducted == "TRUE") {
    return d.count
  }
  else {
    return 0
  }
}

/**
 * Reducer function for contraband NOT FOUND
 * Returns count if contraband was NOT found, else 0
**/
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
// Reducer properties & objectify reducerFuncs
const reducerProps = [
  "black",
  "white"
]

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

const uniqueRaceList = getUniquePropListBy(
  raceSearchContraband,
  "race"
)
```

```js
// 1. Create array for results
const contrabandPercResults = []

/**
 * 2. Loop through RACE values
**/
for (const raceValue of reducerProps) {

  // 3. Loop through reducer functions
  for (const testorObj in reducerFuncs) {

    const totalSearchesForRace = d3.sum(
      raceSearchContraband,
      (d) => {
        if (d.race == raceValue && d.search_conducted == "TRUE") {
          return d.count
        }
      }
    )

    /**
     * Calculate the sum for FOUND or NOT_FOUND
     * using the reducer function
    **/

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
// Filter the data for plotting
// Filter for contraband FOUND only
const blackFound = contrabandPercResults.filter(
  (d) => {
    if (d.race == "black" && d.contraband_status == "FOUND") {
      return true
    }
  }
)

const whiteFound = contrabandPercResults.filter(
  (d) => {
    if (d.race == "white" && d.contraband_status == "FOUND") {
      return true
    }
  }
)
```

```js
// Step 6: Plot with Plot.barY()
Plot.plot({
  height: 400,
  marginLeft: 50,
  marginRight: 100,
  marginBottom: 40,
  marginTop: 50,
  grid: true,
  
  x: {
    label: "RACE", padding: 0
  },
  
  y: {
    label: "Contraband Discovery Rate", padding: 0,
    percent: true
  },
  
  marks: [
    Plot.ruleY([0]),
    
    Plot.barY(
      blackFound,
      {
        x: "race",
        y: "percentage",
        fill: "Black",
        tip: true,
        insetLeft: 80,
        insetRight: 80
      }
    ),
    
    Plot.barY(
      whiteFound,
      {
        x: "race",
        y: "percentage",
        fill: "red",
        tip: true,
        insetLeft: 80,
        insetRight: 80
      }
    )
  ]
})
```

**Key Observation:** Interestingly, Black drivers show a slightly higher contraband discovery rate (19.3%) compared to White drivers (15.3%). This difference means that when Black drivers are searched , contraband is found approximately 1.3 times more often than when White drivers are searched.

However, this finding requires careful interpretation. While the higher hit rate might initially seem to justify the higher search rates for Black drivers, the disparity remains problematic. Black drivers are searched 2.7 times more frequently than White drivers, yet the contraband discovery rate is only 1.3 times higher. This suggests that the threshold for conducting searches may still be lower for Black drivers, officers may be more willing to search Black drivers on weaker evidence. Additionally, a 4% difference in hit rates does not proportionally justify a 170% increase in search rates (2.7x). If searches were truly evidence-based and unbiased, we would expect the search rate disparity to more closely match the contraband discovery rate disparity.

## Part 5: Examining Stop Over Time

So far, we've established that Black drivers face disproportionate stop and search rates. But we haven't yet examined when these stops are happening. Are stops distributed evenly throughout the day? Or are there certain times when disparities are more pronounced?

Understanding the timing of stops helps us identify whether police behavior is consistent, or whether it varies depending on circumstances such as time of day and visibility conditions.

**Extracting Time Information:** First, let's extract the hour from each group to analyze patterns throughout the day. We already have our **stopsWithDates** data with datetime information from our earlier year by year analysis. To analyze stop patterns by hour, we need to extract the hour value from the datetime. We'll create a new array called stopsWithHour that includes all the original stop information plus a new hour property.

```js
const stopsWithHour = []

// Loop through each stop and add hour property
for (const stop of stopsWithDates) {
  const dateObject = new Date(stop.datetime)
  const hourIn24Format = dateObject.getHours()
  
  // Create a new object with all the properties we need
  const stopWithHourAdded = {
    id: stop.id,
    datetime: stop.datetime,
    race: stop.race,
    sex: stop.sex,
    age: stop.age,
    search_conducted: stop.search_conducted,
    search_person: stop.search_person,
    search_vehicle: stop.search_vehicle,
    contraband_found: stop.contraband_found,
    datetime_year: stop.datetime_year,
    datetime_month: stop.datetime_month,
    datetime_week: stop.datetime_week,
    hour: hourIn24Format  // Adding the new hour property
  }
  
  stopsWithHour.push(stopWithHourAdded)
}
```

```js
// Let's check the first stop
stopsWithHour[0]
```

Now that we have the hour information for each stop, let's count how many stops occurred during each hour for each racial group. We'll use our twoLevelRollUpFlatMap utility function to group by hour first, then by race:

```js
const stopsByHourRace = twoLevelRollUpFlatMap(
  stopsWithHour,
  "hour",
  "race",
  "count"
) 
```

<p class="codeblock-caption">
  Interactive output of stops by <code>hour × race</code>
</p>

```js
stopsByHourRace
```
This gives us a dataset showing how many stops occured for each race during each hour of the day (0- 23 in 24 hour format). Now we can calculate the central tendency measures (mean, median, mode) for Black and White drivers to understand what a "typical" hour of policing looks like for each group. 

```js
const blackStopsByHour = stopsByHourRace.filter(
  d => d.race == "black"
)

const whiteStopsByHour = stopsByHourRace.filter(
  d => d.race == "white"
)

// Calculating central tendency for Black drivers
const blackMean = d3.mean(blackStopsByHour, d => d.count)
const blackMedian = d3.median(blackStopsByHour, d => d.count)
const blackMode = d3.mode(blackStopsByHour, d => d.count)

// Calculating central tendency for White drivers
const whiteMean = d3.mean(whiteStopsByHour, d => d.count)
const whiteMedian = d3.median(whiteStopsByHour, d => d.count)
const whiteMode = d3.mode(whiteStopsByHour, d => d.count)
```

Central Tendency Results:

For Black Drivers:

Mean stops per hour: ${blackMean.toFixed(2)}

Median stops per hour: ${blackMedian}

Mode (most common): ${blackMode}

For White Drivers:

Mean stops per hour: ${whiteMean.toFixed(2)}

Median stops per hour: ${whiteMedian}

Mode (most common): ${whiteMode}










```js
const stopsWithDateTime = mapDateObjectForStops(raleighStops, "datetime")

for (const stop of stopsWithDateTime) {
  const dateObject = new Date(stop.datetime)
  
  const hourIn24Format = dateObject.getHours()
  const minuteValue = dateObject.getMinutes()
  
  let hourIn12Format
  if (hourIn24Format === 0) {
    hourIn12Format = 12  // Midnight (0) becomes 12 AM
  }
  else if (hourIn24Format > 12) {
    hourIn12Format = hourIn24Format - 12  // 13 becomes 1, 14 becomes 2, etc.
  }
  else {
    hourIn12Format = hourIn24Format  // 1-12 stays the same
  }
  
  // Step 2: Determine AM or PM
  let periodOfDay
  if (hourIn24Format >= 12) {
    periodOfDay = "PM"
  }
  else {
    periodOfDay = "AM"
  }
  
  // Step 3: Add leading zero to minutes if needed
  let minuteFormatted
  if (minuteValue < 10) {
    minuteFormatted = "0" + minuteValue  // 5 becomes "05"
  }
  else {
    minuteFormatted = minuteValue  // 30 stays "30"
  }
  
  // Step 4: Combine into time string
  stop.time = hourIn12Format + ":" + minuteFormatted + " " + periodOfDay
}
```
```js
stopsWithDateTime
``` --> -->

# H1: Search Disparities- Frequency Distribution Analysis and Visualization

## Overview

In this chapter, we investigate whether Black drivers experience discriminatory search practices during traffic stops. We will examine:

1. **Search patterns by race** - Are black drivers searched more often?
2. **Types of searches** - Do disparities exist in both person searches and vehicle searches?
3. **Gender-specific patterns** - Do racial disparities persist even among women drivers, who are stereotypically considered "safer"?
4. **Contraband discovery rates** - When searches occur, is contraband actually found? Do discovery rates justify the search rate disparities?

**Our hypothesis:** If Black drivers are searched more frequently but contraband is found at similar or lower rates, this indicates racial profiling rather than evidence-based policing. However, we must also consider whether higher contraband discovery rates proportionally justify higher search rates.

## Research Question

**Do Black drivers experience disproportionate search rates compared to White drivers, and if so, are these disparities justified by contraband discovery patterns?**

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

Before we look at searches, let's understand the basic components of our dataset. Which racial groups are represented in our traffic stop data, and how frequently was each group stopped?

### Counting Stops by Race

Let's start by exploring the racial distribution of traffic stops using d3.rollup:

```js
const stopsByRaceMap = d3.rollup(
  raleighStops,
  v => v.length,
  d => d.race
)
```
<p class="codeblock-caption">
  Interactive Map output of Raleigh traffic stops <code>by race</code>
</p>

```js
stopsByRaceMap
```

This gives us a Map structure showing the count for each racial group. For easier analysis and visualization, let's convert this into a cleaner array format:

```js
import {oneLevelRollUpFlatMap} from "./utils/utilsH1.js";

const stopsByRace = oneLevelRollUpFlatMap(
  raleighStops,
  "race",
  "count"
)
```

<p class="codeblock-caption">
  Interactive output of Raleigh traffic stops <code>by race</code>
</p>

```js
stopsByRace
```

### What We Found

Looking at our data, we can see the traffic stop distribution across racial groups from 2011-2015:

- **White drivers:** 134,949 stops (40.8%)
- **Black drivers:** 161,437 stops (48.8%)
- **Hispanic drivers:** 30,146 stops (9.1%)
- **Unknown:** 3,648 stops (1.1%)
- **Asian/Pacific Islander:** 6,712 stops (2.0%)
- **Other:** 175 stops (0.1%)

**Total stops:** 330,967

**Key observation:** Black drivers represent nearly half (48.8%) of all traffic stops, slightly more than White drivers (40.8%). This establishes our baseline. Now let's investigate whether search rates are proportional to these stop numbers, or if certain groups face disproportionate search rates.

```js
// could add a visualization
```

## Part 2: Search Rates by Race

Now let's investigate the key question: Are Black drivers searched at higher rates than White drivers?

### Overall Search Counts

First, let's count how many searches were conducted for each racial group:

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

<p class="codeblock-caption">
  Interactive output of Raleigh traffic stops <code>by race and search</code>
</p>

```js
searchCountsByRace
```

**Initial Observation:** Black drivers experienced nearly 2.7 times more searches than White drivers, despite representing only a slightly larger portion of total stops. This suggests a potential disparity in search practices.

### Breaking Down Search Types

There are two types of searches officers can conduct:

1. Person searches - Searching the driver's body
2. Vehicle searches - Searching the car

**Question:** Is the racial disparity consistent across both search types?

### Person Search counts

```js
// only for person search
// consider applying 2levelrollup
// rather han doing this way consider this way race > search person (true, false) > search count
// const personSearches = raleighStops.filter(
//   d => d.search_person == "TRUE"
// )

// const personSearchByRace = oneLevelRollUpFlatMap(
//   personSearches,
//   "race",
//   "person_search_count"
// )
// ```
// <p class="codeblock-caption">
//   Interactive output of Raleigh traffic stops <code>by race and person search</code>
// </p>

// ```js
// personSearchByRace
// // can add a visualization here

import {twoLevelRollUpFlatMap} from "./utils/utilsH1.js";

const racePersonSearch = twoLevelRollUpFlatMap(
  raleighStops,
  "race",
  "search_person",
  "count"
)
```
<p class="codeblock-caption">
   Interactive output of Raleigh traffic stops <code>by race and person search</code>
</p>

```js
racePersonSearch
```


**Key Observation:** Black drivers experienced 2.7 times more person searches than white drivers. This is nearly identitical to the overall search disparity, showing that racial disparity is not limited to one type of search.

Person searches are particularly invasive as they involve physically searching the driver's body. The fact that Black drivers face this more intrusive search at such a disproportionate rate raises serious concerns about discriminatory enforcement practices.

### Vehicle Search Counts

Let's now examine vehicles searches to see if the same pattern holds.

```js
// follow same thing as previous one. 2 levelrollup
// const vehicleSearches = raleighStops.filter(
//   d => d.search_vehicle == "TRUE"
// )

// const vehicleSearchByRace = oneLevelRollUpFlatMap(
//   vehicleSearches,
//   "race",
//   "vehicle_search_count"
// )
// ```

// <p class="codeblock-caption">
//   Interactive output of Raleigh traffic stops <code>by race and vehicle search</code>
// </p>

// ```js
// vehicleSearchByRace

const raceVehicleSearch = twoLevelRollUpFlatMap(
  raleighStops,
  "race",
  "search_vehicle",
  "count"
)
```
<p class="codeblock-caption">
   Interactive output of Raleigh traffic stops <code>by race and vehicle search</code>
</p>

```js
raceVehicleSearch
```

**Key Observation:** Black drivers experienced 2.8 times more vehicle searches than White drivers which is slightly higher than the overall 2.7 times disparity.

What is more revealing when we compare person searches to vehicle searches - 

- When Black drivers are person-searched, their vehicle is also searched 86% of the time (6,060 vehicle / 7,047 person).
- When White drivers are person-searched, their vehicle is also searched 81% of the time (2,134 vehicle / 2,629 person).

This suggests that once a Black driver is subjected to a person search, officers are more likely to escalate to a vehicle search as well, creating a compounding effect of inrusive searches.  

## Part 3: Gender-Specific Analysis - Black Women vs White Women Drivers

We've established clear racial disparities in overall search rates. Now, let's test this pattern further by examining a specific subgroup: "Women Drivers". 

Women are often stereotyped as "safer" or "more cautious" drivers. If racial disparities persist even among women drivers who presumably pose less threat, this would provide even strong evidence that searches are based on race rather than driving behavior or legitimate safety concerns.

**Research Question:** Do Black women drivers face higher search rates than white women drivers, despite both groups being women?

### Three-Level Analysis: Race > Gender > Search Status

Let's do a comprehensive three-level rollup to examine race, gender, and search patterns simultaneously:

```js
import {threeLevelRollUpFlatMap} from "./utils/utilsH1.js";
```

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
  d => d.contraband_found !== "NA"
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
// present the finding with visualization
```
**Key Observation:** Interestingly, Black drivers show a slightly higher contraband discovery rate (19.3%) compared to White drivers (15.3%). This difference means that when Black drivers are searched , contraband is found approximately 1.3 times more often than when White drivers are searched.

However, this finding requires careful interpretation. While the higher hit rate might initially seem to justify the higher search rates for Black drivers, the disparity remains problematic. Black drivers are searched 2.7 times more frequently than White drivers, yet the contraband discovery rate is only 1.3 times higher. This suggests that the threshold for conducting searches may still be lower for Black drivers, officers may be more willing to search Black drivers on weaker evidence. Additionally, a 4% difference in hit rates does not proportionally justify a 170% increase in search rates (2.7x). If searches were truly evidence-based and unbiased, we would expect the search rate disparity to more closely match the contraband discovery rate disparity.
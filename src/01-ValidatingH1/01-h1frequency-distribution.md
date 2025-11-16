# H1: Search Disparities- Frequency Distribution Analysis

## Overview

In this chapter, we investigate whether Black drivers experience discriminatory search practices during traffic stops. We will examine:

1. **Search patterns by race** - Are black drivers searched more often?
2. **Types of searches** - Person searches vs. vehicle searches.
3. **Contraband discovery rates** - When searched happen, is contraband actually found?
4. **Contrabands types** - Drugs vs weapons.

**Our hypothesis:** If Black drivers are searched more frequently but contraband is found less often, this indicates racial profiling rather than evidence-based policing.

## Research Question

**Do Black drivers experience both higher search rates and lower contraband discovery rates compared to white drivers?**

Let's explore the data to fnd out.

## Loading the Data

First, let's load our Raleigh traffic stops dataset (2011-2015):

```js
const raleighStops = FileAttachment("../data/policestops-with-townships.csv").csv({typed: true});
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
import {oneLevelRollUpFlatMap} from "./utils/utils.js";

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
const personSearches = raleighStops.filter(
  d => d.search_person == "TRUE"
)

const personSearchByRace = oneLevelRollUpFlatMap(
  personSearches,
  "race",
  "person_search_count"
)
```
<p class="codeblock-caption">
  Interactive output of Raleigh traffic stops <code>by race and person search</code>
</p>

```js
personSearchByRace
```

**Key Observation:** Black drivers experienced 2.7 times more person searches than white drivers. This is nearly identitical to the overall search disparity, showing that racial disparity is not limited to one type of search.

Person searches are particularly invasive as they involve physically searching the driver's body. The fact that Black drivers face this more intrusive search at such a disproportionate rate raises serious concerns about discriminatory enforcement practices.

### Vehicle Search Counts

Let's now examine vehicles searches to see if the same pattern holds.

```js
const vehicleSearches = raleighStops.filter(
  d => d.search_vehicle == "TRUE"
)

const vehicleSearchByRace = oneLevelRollUpFlatMap(
  vehicleSearches,
  "race",
  "vehicle_search_count"
)
```

<p class="codeblock-caption">
  Interactive output of Raleigh traffic stops <code>by race and vehicle search</code>
</p>

```js
vehicleSearchByRace
```

**Key Observation:** Black drivers experienced 2.8 times more vehicle searches than White drivers which is slightly higher than the overall 2.7 times disparity.

What is more revealing when we compare person searches to vehicle searches - 

- When Black drivers are person-searched, their vehicle is also searched 86% of the time (6,060 vehicle / 7,047 person).
- When White drivers are person-searched, their vehicle is also searched 81% of the time (2,134 vehicle / 2,629 person).

This suggests that once a Black driver is subjected to a person search, officers are more likely to escalate to a vehicle search as well, creating a compounding effect of inrusive searches.  

## Part 3: Gender-Specific Analysis - Black Women vs White Women Drivers

We,ve established clear racial disparities in oerall search rates. Now, let's test this pattern further by examining a specific subgroup: "Women Drivers". 

Women are often stereotyped as "safer" or "more cautious" drivers. If racial disparities persist even among women drivers who presumably pose less threat, this would provide even strong evidencethat searches are based on race rather than driving behavior or legitimate safety concerns.

**Research Question:** Do Black women drivers face higher search rates than white women drivers, despite both groups being women?

### Three-Level Analyssi: Race > Gender > Search Status

Let's do a comprehensive three-level rollup to examine race, gender, and search patterns simultaneously:

```js
import {threeLevelRollUpFlatMap} from "./utils/utils.js";
```

```js
// Filter for women drivers only
const womenDrivers = raleighStops.filter(
  d => d.sex == "female"
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
  Women only: <code>race × sex × search_person</code>
</p>

```js
womenRacePersonSearch
```



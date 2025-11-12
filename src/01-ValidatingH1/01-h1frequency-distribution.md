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

Let's explore the data to fnd out:

## Loading the Data

First, let's load our Raleigh traffic stops dataset (2011-2015):

```js
const raleighStops = FileAttachment("../data/updated-nc-stops.csv").csv({typed: true});
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
const stopsByRace = d3.rollup(
  raleighStops,
  v => v.length,
  d => d.race
)
```
<p class="codeblock-caption">
  Interactive output of Raleigh traffic stops <code>by race</code>
</p>

```js
stopsByRace
```
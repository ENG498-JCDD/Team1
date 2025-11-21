# Hidden in Darkness
### *Overview*
An analysis on the frequencies of race and datetime for the traffic stops of Raleigh from 2011-2015. This hypothesis is centered around comparing how the date and time relate to traffic stops made, and then applying that to a racialized lens.

This hypothesis claims that because of the reduction of light and visibility during nighttime, drivers cannot be identified by race and therefore cannot be racially profiled and pulled over. 

### 1. Data being utilized:

We will tackle this analysis by first utilizing the police-with-townships.csv file that contains information about traffic stops done throughout the Raleigh area about 10-15 years ago. 

### 2. Searches by Race:

One variable that will be analyzed will be race. Raleigh is a predominantly white city, the same being for Wake County. With this variable, we ask; Are Black drivers being pulled over more often?

### 3. Searches by Date-Time

Date-time is a frequency that is locked together, giving us the year, day and month- as well as the time of the traffic stop. This is what makes this chapter distinct from the others, comparing date-time.

### 4. Rates by Day and Night

Arrests rates by day and night can show us information on if the hypothesis is supported specifically. This can vary and we will have to visualize when this happens since the threshold between sunrise and sunset can differ based on the season. 

## **Let's Begin!**

```js
const raleighStops = FileAttachment("./data/policestops-with-townships.csv").csv({typed: true});
```

```js
raleighStops
```


```js
let raleighStopsInDarkRollUp = d3.rollup(
  raleighStops,
  // (leaf) => leaf.length,
  (leaf) => {
    return {
      meanAge: d3.mean(leaf, l => l.age)
    }
  },
  (D) => D.race,
  (d) => d.datetime,
    (d) => d.outcome
);
```

raleighStopsInDarkRollUp

```js
raleighStopsInDarkRollUp
```


```js
const raleighStopsInDarkGroup = d3.group(raleighStops, 
(d) => d.race,
  (d) => d.datetime,
    (d) => d.outcome
)
```

```js
raleighStopsInDarkGroup
```
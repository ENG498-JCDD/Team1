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

Arrests rates by day and night can show us information on if the hypothesis is supported specifically. This can vary and we will have to visualize when this happens since the threshold between sunrise and sunset can differ based on the season. This will be indicated by hour and by PM or AM.

## **Let's Begin!**

```js
function cleanStops(data) {
  const yearFormatter = d3.utcFormat("%Y");
  const monthFormatter = d3.utcFormat("%B");
  const hourFormatter = d3.utcFormat("%I");
  const ampmFormatter = d3.utcFormat("%p");

  return data.map(d => ({
    ...d,
    year: yearFormatter(d.datetime),
    month: monthFormatter(d.datetime),
    hour: hourFormatter(d.datetime),
    ampm: ampmFormatter(d.datetime),
  }));
}

function fourLevelRollUpFlatMapTime(data, countKey) {
  const colTotals = d3.rollups(
    data,
    v => v.length,
    d => d.race,
    d => d.year,
    d => d.month,
    d => `${d.hour} ${d.ampm}`,
    d => d.outcome
  );

  return colTotals.flatMap(l1Elem => {
    const raceVal = l1Elem[0];
    return l1Elem[1].flatMap(l2Elem => {
      const yearVal = l2Elem[0];
      return l2Elem[1].flatMap(l3Elem => {
        const monthVal = l3Elem[0];
        return l3Elem[1].flatMap(l4Elem => {
          const hourVal = l4Elem[0];
          return l4Elem[1].flatMap(l5Elem => ({
            race: raceVal,
            year: yearVal,
            month: monthVal,
            hour: hourVal,
            outcome: l5Elem[0],
            [countKey]: l5Elem[1]
          }));
        });
      });
    });
  });
}
```

```js
const raleighStops = await FileAttachment("./data/policestops-with-townships.csv").csv({typed: true});
const cleaned = cleanStops(raleighStops);
const rolled = fourLevelRollUpFlatMapTime(cleaned, "count");

rolled
```

```js
cleaned
```

```js
rolled
```

The above shows 2 things; the first Array list shows all of our data grouped up with some extra groupings I ended up coding to cut to the chase. The second Array list shows just that.

This list answers the questions: 
- 
- What is the race of the person being stopped?
- What is the year that they were stopped in?
- What is the month that they were stopped in?
- What is the hour (including if it is AM or PM) that they were stopped in?

```js
// Stops only from 2013
const stops2013 = cleaned.filter(d => d.year === "2013");

// June 2013
const june2013 = stops2013.filter(d => d.month === "June");
const juneCounts2013 = d3.rollups(
  june2013,
  v => v.length,
  d => d.race
).map(([race, count]) => ({ race, month: "June", count }));

// December 2013
const december2013 = stops2013.filter(d => d.month === "December");
const decemberCounts2013 = d3.rollups(
  december2013,
  v => v.length,
  d => d.race
).map(([race, count]) => ({ race, month: "December", count }));

// Combine into one dataset
const combined2013 = juneCounts2013.concat(decemberCounts2013);
```

```js
Plot.plot({
  marks: [
    Plot.barY(
      combined2013,
      { x: "race", y: "count", fill: "month" }  // fill encodes month
    )
  ],
  x: { label: "Race" },
  y: { label: "Number of Stops" },
  color: { legend: true },
  title: "Traffic Stops by Race in June vs December 2013"
})
```

The visualization above lets us analyze stop rates from the solstice months of June and December- which represent respectively the month with the highest hours of daylight vs. the month with the lowest hours of daylight.
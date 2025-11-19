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

```js
constStopsRace = d3.rollup(
  raleighStops,
  (d) = d.length,
  (d) = d.race,
)
```

Interactive output of our dataset counted by length.

```js
constStopsRace
```



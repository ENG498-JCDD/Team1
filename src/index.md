# Stopped: An Analysis of Traffic-Stops by Race in Wake County, North Carolina

Created by Nazifa Chowdhury, Wyatt Blanchette, and Hail Zulueta | <a href="https://jcddtc.netlify.app/" target="_blank" rel="noopenner noreferrer">ENG 583 - Justice-Centered Data Design</a>

## Project Overview

The aim of our project is to uncover biases within police traffic stops in North Carolina. There has been much research linking traffic stops to race within the state, most notably *Suspect Citizens: What 20 Million Traffic Stops Tell Us About Policing and Race* by Dr. Frank Baumgartner. Our data app builds on this scholarship but narrows the scope significantly, focusing on stops which occurred between 2011-2015 and which were conducted in Wake County. 

By using this sample size we hope to emphasize details, stories, and patterns which may have been missed when working with the original data set, initially comprised of stops between 2003 and 2015 in multiple NC cities and counties. Our parsing falls in line with SJ ethics emphasis on complex and multifaceted guiding principles, showing that problems like structural racism look and operate in many different forms and manifestations. As such, critical issues like marginalization and intersectional oppression may require different forms of redress based on both societal treatment but also location-based exclusion, even in situations as micro-specific as the county level.

## Problem Case Scenario

The North Carolina General Assembly is the primary body for statewide law enforcement changes. In 2021, the assembly signed a bipartisan package of bills which enacted a plethora of reforms, including duty-to-intervene policies, standardized data collection in use-of-force incidents, and mental health support for officers. However, led by Republican Speaker of the House Destin Hall and President Pro-Tempore Phil Berger, these efforts have lapsed, data collection has largely ceased, and protections for officers to exercise force have [increased](https://www.ncleg.gov/BillLookUp/2025/H52).

Wake County, for the most part, has acted in accordance with statewide regulations. At the local level, city council and the sheriff's office are responsible for enacting reform policies. There have been a few grassroots movements advocating for these policies county-wide, namely [Refund Raleigh](https://www.acluofnorthcarolina.org/app/uploads/2020/07/refund_raleigh_demands.pdf) and the [Pretrial Reform Project](https://www.wake.gov/departments-government/general-services-administration/pretrial-reform-project), but none have yet resulted in meaningful action.

This brings us to our hypothetical scenario. You are an acting member of Raleigh City Council. With an understanding of the channels in which officer reform is enacted, what policies and funding decisions might you advocate for? More specifically, what changes to traffic stops would you emphasize to realize an *SJ Ethic* and rectify biases stopped drivers may face?

### Hypothesis

Our main hypothesis is that Black drivers face increased risk when encountering traffic stops in the Wake County area. This hypothesis is then divided into three corollary hypotheses corresponding to specific variables in our dataset.

**Search Disparities:** Black drivers are searched at disproportionately higher rates than White drivers, yet contraband discovery rates do not justify this disparity. We examine overall search rates by race, gender-specific patterns, and the "hit rate" (percentage of searches that find contraband) to determine whether searches are evidence-based or potentially biased.

**Veil of Darkness:** The "Veil of Darkness" test uses natural variation in sunset times throughout the year to detect racial profiling. If officers engage in racial profiling, we would expect to see more Black drivers stopped during daylight hours (when race is more visible) compared to the same clock times during darkness. By comparing stop patterns at times like 6:30 PM in summer (daylight) versus winter (darkness), we can test whether darkness affects the racial composition of stopped drivers by reducing officers' ability to perceive race.

**Outcome Disparities:** Black drivers receive harsher outcomes (arrests, citations) compared to White drivers for similar violations. We analyze whether racial disparities exist not only in the decision to stop and search, but also in the consequences drivers face following a stop.

### About the Data

Notably, 2016 seems to be the last year in which county-wide data on traffic stops was collected. Most of the stops in the county are also focused in Raleigh, ignoring both Cary and more rural parts of Wake County. An inital step could be therefore a call for more contemporary and comprehensive data. With these limitations in mind, We'll provide an overview of the data which we have, keeping in mind the call for more thorough collection practices.

There are 24 columns present, including details about the stopped driver's age, race, and sex. The searches are split into if a search was conducted, the vehicle stopped, the reason an investigation was initiated, and whether a frisk was performed. There is also information specific to contraband, the date of the incident, and the presence of a possible citation. Notably, there is very little information about the officer, and officer's hash ids are encrypted. 

The data comes from the [Stanford Open Policing Project](https://openpolicing.stanford.edu/), which collects information on vehicle and pedestrain stops across the country. The data is collected by an interdisciplinary team of researchers and journalists, in hopes of combining statistical analysis practices with data journalism. The initiative is comprised of computer scientists, data scientists, and journalists, both at the student and professor level. 

The project was launched in 2014 and officially began collecting data from states in 2015. They have standardized over 200 million traffic stops since their inceptions but have largely ceased their work as statewide collection efforts have lapsed. In addition to this data, the project also offers tutorials on analysis strategies and a centralized portal dedicated to news publications related to the traffic stops.

#### County Wide Data(?)
Another issue we'd like to address pertains to the areas in which data has been collected. Although the dataset ostensibly represents all of Wake County, there are very few stops outside of townships other than Raleigh. This is illustrated in the geo-spatial map below, where you can see that only 10 non-Raleigh stops exist- a number starkly disproportionate to Raleigh's demographic composition.

### Distribution of Traffic Stops Across Wake County Townships (2011-2015)

```js
const townships = FileAttachment("data/townships.geojson").json()
```

```js
const raleighStops = FileAttachment("data/policestops-with-townships.csv").csv({typed: true})
```

```js
// Count stops by township ID
const stopsByTownship = d3.rollups(
  raleighStops,
  v => v.length,
  d => d.township_id
)
```

```js
const townshipsWithCounts = {
  type: "FeatureCollection",
  features: townships.features.map(township => {
    // Match on properties.TOWNSHIP (1-20)
    const matchingCount = stopsByTownship.find(d => d[0] === township.properties.TOWNSHIP)
    
    return {
      ...township,
      properties: {
        ...township.properties,
        stopCount: matchingCount ? matchingCount[1] : 0
      }
    }
  })
}
```


```js
Plot.plot({
  projection: {
    type: "conic-conformal",
    rotate: [79, 0],
    domain: townshipsWithCounts,
  },
  color: {
    scheme: "warm",
    legend: true,
    label: "Number of Traffic Stops"
  },
  marks: [
    Plot.geo(townshipsWithCounts, {
      fill: d => d.properties.stopCount,
      stroke: "white",
      strokeWidth: 1,
      tip: true,
      title: d => `${d.properties.NAME}: ${d.properties.stopCount.toLocaleString()} stops`
    })
  ],
  margin: 50,
  height: 600,
  width: 800
})
```
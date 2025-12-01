# Stopped: An Analysis of Traffic-Stops by Race in North Carolina

## Project Overview

The aim of our project is to uncover biases within police traffic stops in North Carolina. There has been much research linking traffic stops to race within the state, most notably *Suspect Citizens: What 20 Million Traffic Stops Tell Us About Policing and Race* by Dr. Frank Baumgartner. Our data app builds on this scholarship but narrows the scope significantly, focusing on stops which occurred between 2011-2015 **AND** and which were conducted in Wake County. 

By using this sample size we hope to emphasize details, stories, and patterns which may have been missed when working with the original data set, initially comprised of searches between 2003 to 2015 in multiple NC cities and counties. Our parsing falls in line with SJ ethics emphasis on complex and multifaceted guiding principles, showing that problems like structural racism look and operate in many different forms and manifestations. As such, critical issues like marginalization and intersectional oppression may require different forms of redress based on both societal treatment but also location-based exclusion, even in situations as micro-specific as the county level.

## Problem Case Scenario

The North Carolina General Assembly is the primary body for statewide law enforcement changes. In 2021, the assembly signed a bipartisan package of bills which enacted a plethora of reforms, including duty-to-intervene policies, standardized data collection in use-of-force incidences, and mental health support for officers. However, lead by Republican speaker of the house Destin Hall and President Pro-Tempore Phil Berger, these efforts have lapsed, data collection has largely ceased, and protections for officers to exercise force have [increased](https://www.ncleg.gov/BillLookUp/2025/H52).

Wake County, for the most part, has acted in accordance with statewide regulations. At the local level city council and the sheriff's office are responsible for enacting reforms policies. There have been a few grassroots movements advocating for these polices county-wide, namely [Refund Raleigh](https://www.acluofnorthcarolina.org/app/uploads/2020/07/refund_raleigh_demands.pdf) and the [Pretrial Reform Project](https://www.wake.gov/departments-government/general-services-administration/pretrial-reform-project), but none have yet resulted in meaningful action.

This brings us to our hypothetical scenario. You are an acting member of Raleigh City council. With an understand of the channels in which officer reform is enacted, what policies and funding decisions might you advocate for? More specifically, what changes to traffic stops would you emphasize to realize an *SJ Ethic* and rectify biases stopped drivers may face?

### Hypothesis

Our main hypothesis is that black drivers face increased risk when encountering traffic stops in the Wake County area. This hypothesis is then divided into three corollary hypotheses corresponding to specific variables in our dataset. The first centers around evidence found in searches, the second analyzes time of day as possible motivator for police searches, and the last examines racial-based outcomes. 

### About the Data

Notably, 2016 seems to be the last year in which county-wide data on traffic stops was collected. Most of the stops in the county are also focused in Raleigh, ignoring both Cary and more rural parts of Wake County. An inital step could be therefore a call for more contemporary and comprehensive data. With these limitations in mind, I'll provide an overview of the data which we have, keeping in mind the call for more thorough collection practices.

There are 24 columns present, including details about detainee's age, race, and sex. The searches are split into if a search was conducted, the vehicle stopped, the reason an investigation was initiated, and whether a frisk was performed. There is also information specific to contraband, the date of the incident, and the presence of a possible citation. Notably, there is very little information about the officer, and officer's hash id's are encrypted. 

The data comes from the [Stanford Open Policing Project](https://openpolicing.stanford.edu/), which collects information on vehicle and pedestrain stops across the country. The data is collected by an interdisciplinary team of researchers and journalists, in hopes of combining statistical analysis practices with data journalism. The initiative is comprised of computer scientists, data scientists, and journalists, both at the student and professor level. 

The project was launched in 2014 and officially began collecting data from states in 2015. They have standardized over 200 million traffic stops since their inceptions but have largely ceased their work as statewide collection efforts have lapsed. In addition to this data, the project also offers tutorials on analysis strategies and a centralized portal dedicated to news publications related to the traffic stop.


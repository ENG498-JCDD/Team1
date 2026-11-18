/**
 * constants.js
 * 
 * Constant variables to access across
 * all notebooks.
**/

// Raleigh, NC Population by Race (2011 to 2015 ACS 5 Year Estimates)
// Source: U.S. Census Bureau, Table DP05
// Link: https://data.census.gov/table/ACSDP5Y2015.DP05?q=Raleigh+city,+North+Carolina
export const raleighPop = 432520

export const raleighPopulationByRace = [
  {race: "white", population: 260263, percentage: 260263 / raleighPop},
  {race: "black", population: 126558, percentage: 126558 / raleighPop},
  {race: "asian/pacific islander", population: 19115, percentage: 19115 / raleighPop},
  {race: "hispanic", population: 15191, percentage: 15191 / raleighPop},
  // Leave out, since it can't mirror your stop data
  // {race: "other", population: 9784, percentage: 9784 / raleighPop}
]

// Maps are really helpful for quick lookups
// Figures as per Census:
// https://censusreporter.org/profiles/06000US3718392612-raleigh-township-wake-county-nc/
const asianPI = 19115 + 393
export const raleighPopulationByRaceMap = new Map([
  ["white", {population: 260263, normedPopulation: 260263 / raleighPop}],
  ["black", {population: 126558, normedPopulation: 126558 / raleighPop}],
  ["hispanic", {population: 47992, normedPopulation: 47992 / raleighPop}],
  ["native", {population: 1216, normedPopulation: 1216 / raleighPop}],
  ["asian/pacific islander", {population: asianPI, normedPopulation: asianPI / raleighPop}],
  ["other", {population: null, normedPopulation: null}],
  ["unknown", {population: null, normedPopulation: null}],
])
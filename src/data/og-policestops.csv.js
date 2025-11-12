import {csvFormat, csvParse} from "d3-dsv";
import {utcParse, isoParse} from "d3-time-format";

// Fetches data from hosted URL
// Used in csvParse()
async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

// Use this Map to normalize the location data,
// but be sure to review and check it, because I
// wrote this quickly.
// Converted locations to Township level
const LOCATIONS = new Map(
  [
    ["RA, Wake County", "RALEIGH"],
    ["Raleigh, Wake County", "RALEIGH"],
    ["RALEIGH, Wake County", "RALEIGH"],
    ["RALEGH, Wake County", "RALEIGH"],
    ["RALEOIGH, Wake County", "RALEIGH"],
    ["CA, Wake County", "CARY"],
    ["CR, Wake County", "CARY"],
    ["CY, Wake County", "CARY"],
    ["C, Wake County", "CARY"],
    ["CARY, Wake County", "CARY"],
    ["Cary, Wake County", "CARY"],
    ["WF, Wake County", "WAKE FOREST"],
    ["ROLESVILLE, Wake County", "WAKE FOREST"],
    ["MV, Wake County", "CEDAR FORK"],
    ["GR, Wake County", "SAINT MARY'S"],
    ["GARNER, Wake County", "SAINT MARY'S"],
    ["WD, Wake County", "MARKS CREEK"],
    ["Q, Wake County", "MIDDLE CREEK"],
    ["FV, Wake County", "MIDDLE CREEK"],
    ["AP, Wake County", "WHITE OAK"],
    ["APEX, Wake County", "WHITE OAK"],
    ["HS, Wake County", "HOLLY SPRINGS"],
    ["KD, Wake County", "SAINT MATTHEWS"],
    ["KNIGHTDALE, Wake County", "SAINT MATTHEWS"],
    ["P, Wake County", "PANTHER BRANCH"],
    ["ZB, Wake County", "LITTLE RIVER"],
    ["D, Wake County", "Durham"],
    ["`, Wake County", "UNKNOWN"],
    ["J, Wake County", "UNKNOWN"],
    ["WS, Wake County", "UNKNOWN"],
    ["a, Wake County", "UNKNOWN"],
    [", Wake County", "UNKNOWN"],
    ["nan, Wake County", "UNKNOWN"],
    ["24, Wake County", "UNKNOWN"],
  ]
)

const TOWNSHIP_NUMBERS = new Map(
  [
    ["RA, Wake County", 1],
    ["Raleigh, Wake County", 1],
    ["RALEIGH, Wake County", 1],
    ["RALEGH, Wake County", 1],
    ["RALEOIGH, Wake County", 1],
    ["CA, Wake County", 4],
    ["CR, Wake County", 4],
    ["CY, Wake County", 4],
    ["C, Wake County", 4],
    ["CARY, Wake County", 4],
    ["Cary, Wake County", 4],
    ["WF, Wake County", 19],
    ["ROLESVILLE, Wake County", 19],
    ["MV, Wake County", 5], //CEDAR FORK
    ["GR, Wake County", 16], //SAINT MARY'S
    ["GARNER, Wake County", 16], //SAINT MARY'S
    ["WD, Wake County", 10],
    ["Q, Wake County", 12],
    ["FV, Wake County", 12],
    ["AP, Wake County", 20],
    ["APEX, Wake County", 20],
    ["HS, Wake County", 6],
    ["KD, Wake County", 17],
    ["KNIGHTDALE, Wake County", 17],
    ["P, Wake County", 15],
    ["ZB, Wake County", 9],
    ["D, Wake County", "Durham"],
    ["`, Wake County", "UNKNOWN"],
    ["J, Wake County", "UNKNOWN"],
    ["WS, Wake County", "UNKNOWN"],
    ["a, Wake County", "UNKNOWN"],
    [", Wake County", "UNKNOWN"],
    ["nan, Wake County", "UNKNOWN"],
    ["24, Wake County", "UNKNOWN"],
  ]
)

// Normalize varied location values and
// map strange or empty inputs as "UNKNOWN"
const normalizeLocation = (d) => {

  const newNormal = LOCATIONS.get(d)

  if ( (newNormal != null) || (newNormal != "") ) {
    return newNormal
  }
  else {
    return "UNKNOWN"
  }

}

const normalizeTownshipNumbers = (d) => {

  const newNormal = TOWNSHIP_NUMBERS.get(d)

  if ( (newNormal != null) || (newNormal != "") ) {
    return newNormal
  }
  else {
    return "UNKNOWN"
  }

}

/**
 * ncPoliceStops: Load and parse police data
 * from GH and trim down to smaller size, where
 * possible
 *
 * Redundant Columns Info Removed:
 *
 * department_name == "Raleigh Police Department"
 * type == "vehicular"
 * county_name == "Wake County"
 * raw_Ethnicity
 * raw_Race
 * raw_action_description
**/
const ncPoliceStops = csvParse(
  await text("https://media.githubusercontent.com/media/ENG498-JCDD/Team1/refs/heads/main/src/data/nc-stops.csv"),
  (d) => ({
    id: d.raw_row_number,
    datetime: isoParse(`${d.date}T${d.time}`),
    original_location: d.location,
    township_name: normalizeLocation(d.location),
    township_id: normalizeTownshipNumbers(d.location),
    age: d.subject_age,
    race: d.subject_race,
    sex: d.subject_sex,
    officer_id_hash: d.officer_id_hash,
    arrest_made: d.arrest_made,
    citation_issued: d.citation_issued,
    warning_issued: d.warning_issued,
    outcome: d.outcome,
    contraband_found: d.contraband_found, // NA
    contraband_drugs: d.contraband_drugs, // NA
    contraband_weapons: d.contraband_weapons, // NA
    frisk_performed: d.frisk_performed, // boolean
    search_conducted: d.search_conducted,
    search_person: d.search_person,
    search_vehicle: d.search_vehicle,
    search_basis: d.search_basis,
    reason_for_frisk: d.reason_for_frisk,
    reason_for_search: d.reason_for_search,
    reason_for_stop: d.reason_for_stop,
  })
)
// IDEA: Reduce data even more by
// creating separate data loader files,
// based on filtering options.
// .filter((d) => d.search_conducted === "TRUE")

// Write out csv formatted data.
process.stdout.write(csvFormat(ncPoliceStops));

// const filtered = ncPoliceStops.filter(d => {
//   if (d.datetime !== null) {
//     const year = d.datetime.getFullYear();
//     if ((year >= 2011) && (year <= 2015)) {
//       return d
//     }
//   }
// });

// process.stdout.write(csvFormat(filtered));

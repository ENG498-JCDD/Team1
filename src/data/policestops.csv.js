// import {csvFormat, csvParse} from "d3-dsv";
// import {utcParse, isoParse} from "d3-time-format";

// // Fetches data from hosted URL
// // Used in csvParse()
// async function text(url) {
//   const response = await fetch(url);
//   if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
//   return response.text();
// }

// // Use this Map to normalize the location data,
// // but be sure to review and check it, because I
// // wrote this quickly.
// const LOCATIONS = new Map(
//   [
//     ["RA, Wake County", "Raleigh"],
//     ["CA, Wake County", "Cary"],
//     ["WF, Wake County", "Wake Forest"],
//     ["MV, Wake County", "Morrisville"],
//     ["GR, Wake County", "Garner"],
//     ["RALEIGH, Wake County", "Raleigh"],
//     ["WD, Wake County", "Wendell"],
//     ["Q, Wake County", "Fuquay-Varina"],
//     ["FV, Wake County", "Fuquay-Varina"],
//     ["AP, Wake County", "Apex"],
//     ["HS, Wake County", "Holly Springs"],
//     ["CR, Wake County", "Cary"],
//     ["`, Wake County", "UNKNOWN"],
//     ["CY, Wake County", "Cary"],
//     ["KD, Wake County", "Knightdale"],
//     ["J, Wake County", "UNKNOWN"],
//     ["WS, Wake County", "UNKNOWN"],
//     ["a, Wake County", "UNKNOWN"],
//     ["ZB, Wake County", "Zebulon"],
//     ["D, Wake County", "Durham"],
//     [", Wake County", "UNKNOWN"],
//     ["C, Wake County", "Cary"],
//     ["nan, Wake County", "UNKNOWN"],
//     ["24, Wake County", "UNKNOWN"],
//     ["RALEGH, Wake County", "Raleigh"],
//     ["RALEOIGH, Wake County", "Raleigh"],
//     ["P, Wake County", "UNKNOWN"],
//     ["KNIGHTDALE, Wake County", "Knightdale"],
//     ["ROLESVILLE, Wake County", "Rolesville"],
//     ["Raleigh, Wake County", "Raleigh"],
//     ["CARY, Wake County", "Cary"],
//     ["Cary, Wake County", "Cary"],
//     ["GARNER, Wake County", "Garner"],
//     ["APEX, Wake County", "Apex"]
//   ]
// )

// // Normalize varied location values and
// // map strange or empty inputs as "UNKNOWN"
// function normalizeLocation(d) {
//   return LOCATIONS.get(d) ?? "UNKNOWN";
// }

// /**
//  * ncPoliceStops: Load and parse police data
//  * from GH and trim down to smaller size, where
//  * possible
//  *
//  * Redundant Columns Info Removed:
//  *
//  * department_name == "Raleigh Police Department"
//  * type == "vehicular"
//  * county_name == "Wake County"
//  * raw_Ethnicity
//  * raw_Race
//  * raw_action_description
//  */
// const ncPoliceStops = csvParse(
//   await text("https://media.githubusercontent.com/media/ENG498-JCDD/Team1/refs/heads/main/src/data/nc-stops.csv"),
//   (d) => ({
//     id: d.raw_row_number,
//     datetime: isoParse(`${d.date}T${d.time}`),
//     location: normalizeLocation(d.location),
//     age: d.subject_age,
//     race: d.subject_race,
//     sex: d.subject_sex,
//     officer_id_hash: d.officer_id_hash,
//     arrest_made: d.arrest_made,
//     citation_issued: d.citation_issued,
//     warning_issued: d.warning_issued,
//     outcome: d.outcome,
//     contraband_found: d.contraband_found, // NA
//     contraband_drugs: d.contraband_drugs, // NA
//     contraband_weapons: d.contraband_weapons, // NA
//     frisk_performed: d.frisk_performed, // boolean
//     search_conducted: d.search_conducted,
//     search_person: d.search_person,
//     search_vehicle: d.search_vehicle,
//     search_basis: d.search_basis,
//     reason_for_frisk: d.reason_for_frisk,
//     reason_for_search: d.reason_for_search,
//     reason_for_stop: d.reason_for_stop,
//   })
// )
// // IDEA: Reduce data even more by
// // creating separate data loader files,
// // based on filtering options.
// // .filter((d) => d.search_conducted === "TRUE")

// // Write out csv formatted data.
// // process.stdout.write(csvFormat(ncPoliceStops));

// const filtered = ncPoliceStops.filter(d => {
//   const year = d.datetime.getFullYear();
//   return year >= 2011 && year <= 2015;
// });

// process.stdout.write(csvFormat(filtered));


import {csvFormat, csvParse} from "d3-dsv";
import {isoParse} from "d3-time-format";

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

const LOCATIONS = new Map(
  [
    ["RA, Wake County", "Raleigh"],
    ["CA, Wake County", "Cary"],
    ["WF, Wake County", "Wake Forest"],
    ["MV, Wake County", "Morrisville"],
    ["GR, Wake County", "Garner"],
    ["RALEIGH, Wake County", "Raleigh"],
    ["WD, Wake County", "Wendell"],
    ["Q, Wake County", "Fuquay-Varina"],
    ["FV, Wake County", "Fuquay-Varina"],
    ["AP, Wake County", "Apex"],
    ["HS, Wake County", "Holly Springs"],
    ["CR, Wake County", "Cary"],
    ["`, Wake County", "UNKNOWN"],
    ["CY, Wake County", "Cary"],
    ["KD, Wake County", "Knightdale"],
    ["J, Wake County", "UNKNOWN"],
    ["WS, Wake County", "UNKNOWN"],
    ["a, Wake County", "UNKNOWN"],
    ["ZB, Wake County", "Zebulon"],
    ["D, Wake County", "Durham"],
    [", Wake County", "UNKNOWN"],
    ["C, Wake County", "Cary"],
    ["nan, Wake County", "UNKNOWN"],
    ["24, Wake County", "UNKNOWN"],
    ["RALEGH, Wake County", "Raleigh"],
    ["RALEOIGH, Wake County", "Raleigh"],
    ["P, Wake County", "UNKNOWN"],
    ["KNIGHTDALE, Wake County", "Knightdale"],
    ["ROLESVILLE, Wake County", "Rolesville"],
    ["Raleigh, Wake County", "Raleigh"],
    ["CARY, Wake County", "Cary"],
    ["Cary, Wake County", "Cary"],
    ["GARNER, Wake County", "Garner"],
    ["APEX, Wake County", "Apex"]
  ]
)

function normalizeLocation(d) {
  return LOCATIONS.get(d) ?? "UNKNOWN";
}

const ncPoliceStops = csvParse(
  await text("https://media.githubusercontent.com/media/ENG498-JCDD/Team1/refs/heads/main/src/data/nc-stops.csv"),
  (d) => {
    const datetime = isoParse(`${d.date}T${d.time}Z`);
    return {
      id: d.raw_row_number,
      datetime, // might be null if bad format
      location: normalizeLocation(d.location),
      age: d.subject_age,
      race: d.subject_race,
      sex: d.subject_sex,
      officer_id_hash: d.officer_id_hash,
      arrest_made: d.arrest_made,
      citation_issued: d.citation_issued,
      warning_issued: d.warning_issued,
      outcome: d.outcome,
      contraband_found: d.contraband_found,
      contraband_drugs: d.contraband_drugs,
      contraband_weapons: d.contraband_weapons,
      frisk_performed: d.frisk_performed,
      search_conducted: d.search_conducted,
      search_person: d.search_person,
      search_vehicle: d.search_vehicle,
      search_basis: d.search_basis,
      reason_for_frisk: d.reason_for_frisk,
      reason_for_search: d.reason_for_search,
      reason_for_stop: d.reason_for_stop,
    };
  }
);


const filtered = ncPoliceStops.filter(d => {
  if (!d.datetime) return false; // skip invalid/missing
  const year = d.datetime.getUTCFullYear();
  return year >= 2011 && year <= 2015;
});

process.stdout.write(csvFormat(filtered));

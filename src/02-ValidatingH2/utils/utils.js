/**
  * File: utils.js
  * Goal: Any general utility functions
  *       to use in this section of the
  *       book.
**/
import {ascending,descending,sum,rollup,rollups} from "d3-array"
import {utcParse,utcFormat} from "d3-time-format"

// Date Parser / Formatters
const parseDate = utcParse("%m/%d/%Y")
const formatWeekNumber = utcFormat("%W")
const formatMonth = utcFormat("%m")
const formatYear= utcFormat("%Y")

export const getUniqueDataBy = (arr, key) => {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

/** getUniquePropListBy()
 * Goal: Create a unique list of `x` property
 *       in an array of objects.
 * @params
 *   - arr: Array. Any array of objects.
 *   - key: String. Desired property to isolate.
 * @return
 *   - uniqList: Array. List of unique data values.
**/
export const getUniquePropListBy = (arr, key) => {
  const uniqueObjs = [...new Map(arr.map(item => [item[key], item])).values()]
  const uniqList = []
  for (const o of uniqueObjs) {
    uniqList.push(o[key])
  }
  return uniqList
}


export const mapDateObject = (data, dateField) => {
  const updatedData = data.map((ballot) => {
    // 1. Skip any null request dates
    if (ballot[dateField] != null) {

      const objField = dateField+"_obj"
      const weekField = dateField+"_week"
      const monthField = dateField+"_month"
      const yearField = dateField+"_yr"

      ballot[objField] = parseDate(ballot[dateField])
      ballot[weekField] = Number( formatWeekNumber(ballot[objField]) )
      ballot[monthField] = Number( formatMonth(ballot[objField]) )
      ballot[yearField] = formatYear(ballot[objField])

      // Fix ballot's input as 2022, e.g., 9/27/22 or 10/22/22,
      // to 9/27/24 or 10/22/24
      // if (ballot.ballot_req_dt.endsWith("22")) {
      //   // Regex: searches for anything that matches
      //   // "/22" at the end of the string
      //   const regexYear = /\/22$/i
      //   const fixedBallotYear = ballot.ballot_req_dt.replace(regexYear, "/24")
      //   ballot.ballot_req_dt = fixedBallotYear

      //   // Parse date string and format week and year
      //   ballot.ballot_req_dt_obj = parseDate(fixedBallotYear)
      //   ballot.ballot_req_week = Number( formatWeekNumber(ballot.ballot_req_dt_obj) )
      //   ballot.ballot_req_month = Number( formatMonth(ballot.ballot_req_dt_obj) )
      //   ballot.ballot_req_yr = formatYear(ballot.ballot_req_dt_obj)
      // }
      // else {
      //   ballot.ballot_req_dt_obj = parseDate(ballot.ballot_req_dt)
      //   ballot.ballot_req_week = Number( formatWeekNumber(ballot.ballot_req_dt_obj) )
      //   ballot.ballot_req_month = Number( formatMonth(ballot.ballot_req_dt_obj) )
      //   ballot.ballot_req_yr = formatYear(ballot.ballot_req_dt_obj)
      // }
    }
    return ballot
  }).sort(
    (a, b) =>  {
      return ascending(a.ballot_req_dt_week, b.ballot_req_dt_week)
    }
  )
  return updatedData
}

/** oneLevelRollUpFlatMap()
 * Groups & counts data by one level
 * @params
 *    - data: Array of objects. Data to rollup and sum up.
 *    - level1Key: String. Desired field from `data` to count.
 *    - countKey: String. Provided key name for new property of calculated Number value
 * @return
 *    - Array of objects with level property and its absolute frequency as "af" property
**/
export const oneLevelRollUpFlatMap = (data, level1Key, countKey) => {

  // 1. Rollups on one level
  const colTotals = rollups(
    data,
    (v) => v.length, // Count length of leaf node
    (d) => d[level1Key] // d["race"]
  )

  // 2. Flatten back to array of objects
  const flatTotals = colTotals.flatMap((e) => {
    return {
      [level1Key]: e[0],
      [countKey]: e[1]
    }
  })

  // 3. Return the sorted totals
  return flatTotals
}

/** twoLevelRollUpFlatMap()
 * Groups & counts data by two levels
 * @params
 *    - data: Array of objects. Data to rollup and sum up.
 *    - level1Key: String. Name of key for 1st level.
 *    - level2Key: String. Name of key for 2nd level.
 *    - countKey: String. Provided key name for new property of calculated Number value
 * @return
 *    - Flattened array of objects with 2 levels and this group's absolute frequency as "Count" property
**/
export const twoLevelRollUpFlatMap = (data, level1Key, level2Key, countKey) => {

  // 1. Rollups on 2 nested levels
  const colTotals = rollups(
    data,
    (v) => v.length, // Count length of leaf node
    (d) => d[level1Key], // Accessor at 1st level
      (d) => d[level2Key], // Accessor at 2nd level
  )
  /**
   * OOPS! colTotals is NOT a flat array of objects!
   */

  // 2. Flatten 1st grouped level back to array of objects
  const flatTotals = colTotals.flatMap((l1Elem) => {

    // 2.1 Assign level 1 key
    let l1KeyValue = l1Elem[0]

    // 2.2 Flatten 2nd grouped level
    const flatLevels = l1Elem[1].flatMap((l2Elem) => {

      // 2.2.1 Assign level 2 key
      let l2KeyValue = l2Elem[0]

      // 2.2.2 Return fully populated object
      return {
        [level1Key]: l1KeyValue,
        [level2Key]: l2KeyValue,
        [countKey]: l2Elem[1]
      }
    })

    // 3. Return flattened array of objects
    return flatLevels
  })
  // 3. Return the sorted totals
  return flatTotals
}

export const threeLevelRollUpFlatMap = (data, level1Key, level2Key, level3Key, countKey) => {

  // 1. Rollups on 2 nested levels
  const colTotals = rollups(
    data,
    (v) => v.length, //Count length of leaf node
    (d) => d[level1Key], //Accessor at 1st level
      (d) => d[level2Key], //Accessor at 2nd level
        (d) => d[level3Key], //Accessor at 3rd level
  )

  // 2. Flatten 1st grouped level back to array of objects
  const flatTotals = colTotals.flatMap((l1Elem) => {

    // 2.1 Assign level 1 key
    let l1KeyValue = l1Elem[0]

    // 2.2 Flatten 2nd grouped level
    const flatLevels = l1Elem[1].flatMap((l2Elem) => {

      // 2.2.1 Assign level 2 key
      let l2KeyValue = l2Elem[0]

      // 2.3.1 Flatten third level
      const flat3Levels = l2Elem[1].flatMap((l3Elem) => {

        // 2.2.1 Assign level 2 key
        let l3KeyValue = l3Elem[0]

        // 2.2.2 Return fully populated object
        return {
          [level1Key]: l1KeyValue,
          [level2Key]: l2KeyValue,
          [level3Key]: l3KeyValue,
          [countKey]: l3Elem[1]
        }

      })

      return flat3Levels
    })

    // 3. Return flattened array of objects
    return flatLevels
  })

  // 3. Return the sorted totals
  return flatTotals
}
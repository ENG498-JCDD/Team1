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

import {rollups} from "npm:d3-array";

// oneLevelRollUpFlatMap function

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
import {rollups} from "npm:d3-array";

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

// twoLevelRollUpFlatMap function

export const twoLevelRollUpFlatMap = (data, level1Key, level2Key, countKey) => {

  // 1. Rollups on 2 nested levels
  const colTotals = rollups(
    data,
    (v) => v.length, //Count length of leaf node
    (d) => d[level1Key], //Accessor at 1st level
      (d) => d[level2Key], //Accessor at 2nd level
  )

  // 2. Flatten 1st grouped level back to array of objects
  const flatTotals = colTotals.flatMap((l1Elem) => {

    // 2.1 Assign level 1 key
    let l1KeyValue = l1Elem[0]

    // 2.2 Flatten 2nd grouped level
    const flatLevels = l1Elem[1].flatMap((l2Elem) => {

      // 2.2.1 Assign level 2 key
      let l2KeyValue = l2Elem[0]

      // l2Elem[1].flatMap()

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

// threeLevelRollUpFlatMap function

export const threeLevelRollUpFlatMap = (data, level1Key, level2Key, level3Key, countKey) => {
  
  // 1. Rollups on 3 nested levels
  const colTotals = rollups(
    data,
    (v) => v.length, 
    (d) => d[level1Key], 
      (d) => d[level2Key], 
        (d) => d[level3Key] 
  )
  
  // 2. Flatten 1st level
  const flatTotals = colTotals.flatMap((l1Elem) => {
    
    // 2.1 Get level 1 value
    let l1KeyValue = l1Elem[0]
    
    // 2.2 Flatten 2nd level
    const flatLevel2 = l1Elem[1].flatMap((l2Elem) => {
      
      // 2.2.1 Get level 2 value
      let l2KeyValue = l2Elem[0]
      
      // 2.3 Flatten 3rd level
      const flatLevel3 = l2Elem[1].flatMap((l3Elem) => {
        
        // 2.3.1 Get level 3 value
        let l3KeyValue = l3Elem[0]
        
        // 2.3.2 Return fully populated object
        return {
          [level1Key]: l1KeyValue,
          [level2Key]: l2KeyValue,
          [level3Key]: l3KeyValue,
          [countKey]: l3Elem[1]
        }
      })
      
      return flatLevel3
    })
    
    return flatLevel2
  })
  
  // 3. Return the flattened array
  return flatTotals
}
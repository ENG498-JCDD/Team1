import {rollups} from "npm:d3-array";
import {utcFormat} from "npm:d3-time-format";

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

export const normalizeLocation = (d) => {
  /**
   * Use .get() to retrieve the keyed varied value
   * linked to a value that will normalize it.
   * EXAMPLES:
   *  - Incoming value of `"RALEOIGH, Wake County"`
   *    will return a normed value of `"RALEIGH"`
   *  - Incoming value of `"RA, Wake County"`
   *    will return a normed value of `"RALEIGH"`
  **/
  const newNormal = LOCATIONS.get(d)

  if ( (newNormal != null) || (newNormal != "") ) {
    return newNormal
  }
  else {
    return "NOT_FOUND"
  }

}

export const addDateAndTimeFeatures = (data) => {
  const yearFormatter = utcFormat("%Y");
  const monthFormatter = utcFormat("%B");
  const dayFormatter = utcFormat("%a %d");
  const dayOfYearFormatter = utcFormat("%a %d");
  const hourFormatter = utcFormat("%I");
  const ampmFormatter = utcFormat("%p");

  return data.map(d => ({
    ...d,
    year: yearFormatter(d.datetime),
    month: monthFormatter(d.datetime),
    day: dayFormatter(d.datetime),
    day_of_year: dayOfYearFormatter(d.datetime),
    hour: hourFormatter(d.datetime),
    ampm: ampmFormatter(d.datetime),
  }));
}

export const fourLevelRollUpFlatMapTime = (data, countKey) => {
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

export const getRace = (raceOutcomeString) => {
  // regex pattern for "race-outcome"
  const reGroupString = /(.{1,})-.{1,}/gm;
  // Find matches
  const matches = reGroupString.exec(raceOutcomeString);
  // Return only first group in match, which is the race category
  const justRace = matches[1].trim();
  return justRace
}

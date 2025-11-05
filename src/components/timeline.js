import * as Plot from "npm:@observablehq/plot";
import {rollups} from "d3-array";

export function timeline(events, {width, height} = {}) {
  return Plot.plot({
    width,
    height,
    marginTop: 30,
    x: {nice: true, label: null, tickFormat: ""},
    y: {axis: null},
    marks: [
      Plot.ruleX(events, {x: "year", y: "y", markerEnd: "dot", strokeWidth: 2.5}),
      Plot.ruleY([0]),
      Plot.text(events, {x: "year", y: "y", text: "name", lineAnchor: "bottom", dy: -10, lineWidth: 10, fontSize: 12})
    ]
  });
}

// oneLevelRollUpFlatMap()

export const oneLevelRollUpFlatMap = (data, level1Key, countKey) => {
  // 1. Rollups on one level
  const colTotals = rollups(
    data,
    (v) => v.length,
    (d) => d[level1Key]
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
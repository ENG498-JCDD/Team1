import { rollups } from "npm:d3-array";
import * as d3 from "npm:d3";

/** cleanStops()
 * Add year, month, hour, am/pm fields to each stop
 */
export const cleanStops = (data) => {
  const yearFormatter = d3.utcFormat("%Y");
  const monthFormatter = d3.utcFormat("%B");
  const hourFormatter = d3.utcFormat("%I");   // 12-hour clock
  const ampmFormatter = d3.utcFormat("%p");   // AM or PM

  return data.map(d => ({
    ...d,
    year: yearFormatter(d.datetime),
    month: monthFormatter(d.datetime),
    hour: hourFormatter(d.datetime),
    ampm: ampmFormatter(d.datetime),
  }));
};

/** oneLevelRollUpFlatMap()
 * Roll up on one property → count
 */
export const oneLevelRollUpFlatMap = (data, level1Key, countKey) => {
  const colTotals = rollups(
    data,
    (v) => v.length,
    (d) => d[level1Key]
  );

  const flatTotals = colTotals.flatMap(e => ({
    [level1Key]: e[0],
    [countKey]: e[1]
  }));

  return flatTotals;
};

/** twoLevelRollUpFlatMap()
 * Roll up on two properties → count
 */
export const twoLevelRollUpFlatMap = (data, level1Key, level2Key, countKey) => {
  const colTotals = rollups(
    data,
    (v) => v.length,
    (d) => d[level1Key],
    (d) => d[level2Key]
  );

  const flatTotals = colTotals.flatMap(l1Elem => {
    const l1Val = l1Elem[0];
    return l1Elem[1].flatMap(l2Elem => ({
      [level1Key]: l1Val,
      [level2Key]: l2Elem[0],
      [countKey]: l2Elem[1]
    }));
  });

  return flatTotals;
};

/** threeLevelRollUpFlatMapTime()
 * Roll up by race → year → hour → outcome
 */
export const threeLevelRollUpFlatMapTime = (data, countKey) => {
  const colTotals = rollups(
    data,
    (v) => v.length,
    (d) => d.race,
    (d) => d.year,
    (d) => `${d.hour} ${d.ampm}`,
    (d) => d.outcome
  );

  const flatTotals = colTotals.flatMap(l1Elem => {
    const raceVal = l1Elem[0];
    return l1Elem[1].flatMap(l2Elem => {
      const yearVal = l2Elem[0];
      return l2Elem[1].flatMap(l3Elem => {
        const hourVal = l3Elem[0];
        return l3Elem[1].flatMap(l4Elem => ({
          race: raceVal,
          year: yearVal,
          hour: hourVal,
          outcome: l4Elem[0],
          [countKey]: l4Elem[1]
        }));
      });
    });
  });

  return flatTotals;
};
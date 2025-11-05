# Raleigh: Traffic Stops Data

## Loading the Data

```js
const raleighStops = FileAttachment("./../data/nc-stops/raleigh-stops.csv").csv({typed: true});
```

<p class="codeblock-caption">
  Interactive output of full data set in <code>raleighStops</code>
</p>

```js
raleighStops
```
<p class="codeblock-caption">
  Interactive output of one row <code>raleighStops</code>
</p>

```js
raleighStops[0]
```
## Analyse the Data
### Count by Race

```js
d3.rollup(
  raleighStops,
  v => v.length, //count
  d => d.subject_race //group by race
)
```

### Count by Race and 
```js
d3.rollup(
  raleighStops,
  v => v.length, //count
  d => d.subject_race, //group by race
    d => d.raw_action_description
)
```

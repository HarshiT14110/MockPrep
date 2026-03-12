import React from "react";
import {
RadarChart,
Radar,
PolarGrid,
PolarAngleAxis,
PolarRadiusAxis
} from "recharts";

export default function SkillRadarChart(){

const data=[

{skill:"DSA",value:80},
{skill:"System Design",value:40},
{skill:"Communication",value:65},
{skill:"Problem Solving",value:75},
{skill:"Coding",value:85}

];

return(

<div style={{width:"100%",display:"flex",justifyContent:"center"}}>

<RadarChart outerRadius={90} width={300} height={250} data={data}>

<PolarGrid />

<PolarAngleAxis dataKey="skill" />

<PolarRadiusAxis />

<Radar
dataKey="value"
stroke="#c9820a"
fill="#c9820a"
fillOpacity={0.6}
/>

</RadarChart>

</div>

)

}
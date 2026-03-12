import React from "react";

export default function AISkillPrediction({T}:any){

const skills=[
{name:"DSA",growth:12},
{name:"System Design",growth:15},
{name:"Communication",growth:8}
]

return(

<div
style={{
padding:28,
borderRadius:20,
background:T.cardBg,
border:`1px solid ${T.cardBorder}`
}}
>

<h3>AI Skill Prediction</h3>

{skills.map((s,i)=>(

<div key={i} style={{
display:"flex",
justifyContent:"space-between",
fontSize:12,
marginTop:10
}}>
<span>{s.name}</span>
<span style={{color:"limegreen"}}>
+{s.growth}%
</span>
</div>

))}

</div>

)

}
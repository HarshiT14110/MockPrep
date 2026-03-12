import React from "react";
import { motion } from "motion/react";

export default function WeeklyProgressCard({ T }: any) {

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const progress = [1,1,0,1,1,0,1];

return (

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
style={{
padding:24,
borderRadius:20,
background:T.cardBg,
border:`1px solid ${T.cardBorder}`
}}
>

<h3 style={{
fontSize:15,
fontWeight:700,
marginBottom:16
}}>
Weekly Progress
</h3>

<div style={{
display:"flex",
justifyContent:"space-between"
}}>

{days.map((d,i)=>(

<div key={i} style={{textAlign:"center"}}>

<div
style={{
width:36,
height:36,
borderRadius:10,
background:progress[i]?T.accent:T.accentSoft,
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#fff",
fontSize:14,
fontWeight:700
}}
>
{progress[i]?"✓":""}
</div>

<p style={{
fontSize:10,
marginTop:6,
color:T.textMuted
}}>
{d}
</p>

</div>

))}

</div>

</motion.div>

)

}   
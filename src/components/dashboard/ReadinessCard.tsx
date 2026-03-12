import React from "react";
import { motion } from "motion/react";

export default function ReadinessCard({score,T}:any){

return(

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
style={{
padding:28,
borderRadius:20,

background:T.cardBg,
display: "flex",
flexDirection: "column",
alignItems: "flex-start"

}}
>

<h3>Interview Readiness</h3>

<div style={{
fontSize:36,
fontWeight:700,
color:T.accent

}}>
{score}%
</div>

<p style={{fontSize:12,marginTop:6}}>
Based on resume, practice sessions and AI analysis
</p>

</motion.div>

)

}
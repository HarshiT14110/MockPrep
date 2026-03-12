import React from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti"

export default function AchievementsCard({ T }: any){


    const triggerConfetti = () => {

confetti({
particleCount:120,
spread:80,
origin:{y:0.6}
})

}

const achievements = [

{icon:"🏅",title:"First Interview"},
{icon:"🔥",title:"5 Day Streak"},
{icon:"🚀",title:"10 Sessions"},
{icon:"🧠",title:"ATS Score 80+"}

];

return(

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
style={{
padding:24,
borderRadius:20,
background:T.cardBg,
border:`1px solid ${T.cardBorder}`
}}
>

<h3 style={{fontSize:15,fontWeight:700,marginBottom:14}}>
Achievements
</h3>

<div style={{display:"flex",flexDirection:"column",gap:10}}>

{achievements.map((a,i)=>(

<div
key={i}
style={{
display:"flex",
alignItems:"center",
gap:10,
fontSize:13
}}
>

<span style={{fontSize:18}}>
{a.icon}
</span>

<span>
{a.title}
</span>

</div>

))}

</div>

</motion.div>

)

}
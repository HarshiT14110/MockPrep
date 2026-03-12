import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function DailyChallengeCard({ T }: any){

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

<h3 style={{
fontSize:15,
fontWeight:700
}}>
Daily Challenge
</h3>

<p style={{
fontSize:12,
marginTop:8,
color:T.textMuted
}}>
Reverse a Linked List
</p>

<Link to="/live-interview">

<button
style={{
marginTop:14,
padding:"8px 16px",
borderRadius:10,
border:"none",
background:T.accent,
color:"#fff",
fontWeight:600,
cursor:"pointer"
}}
>

Start Challenge

</button>

</Link>

</motion.div>

)

}
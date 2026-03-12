import { motion } from "motion/react";

export default function AICube(){

return(

<motion.div
animate={{rotateY:360}}
transition={{
duration:25,
repeat:Infinity,
ease:"linear"
}}
style={{
width:160,
height:160,
position:"relative",
transformStyle:"preserve-3d"
}}
>

{[0,1,2,3,4,5].map(i=>(
<div
key={i}
style={{
position:"absolute",
width:"100%",
height:"100%",
background:"rgba(124,58,237,0.15)",
border:"1px solid rgba(124,58,237,0.4)",
backdropFilter:"blur(10px)"
}}
/>
))}

</motion.div>

)

}
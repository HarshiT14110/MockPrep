import { motion } from "motion/react";

export default function AnimatedBackground() {

return (

<div
style={{
position:"fixed",
inset:0,
zIndex:-1,
overflow:"hidden",
pointerEvents:"none"
}}
>

<motion.div
animate={{
x:[0,50,0],
y:[0,-40,0]
}}
transition={{
duration:25,
repeat:Infinity,
ease:"easeInOut"
}}
style={{
position:"absolute",
width:500,
height:500,
borderRadius:"50%",
background:"radial-gradient(circle,#7c3aed55,transparent)",
top:"10%",
left:"15%",
filter:"blur(80px)"
}}
/>

<motion.div
animate={{
x:[0,-60,0],
y:[0,50,0]
}}
transition={{
duration:30,
repeat:Infinity
}}
style={{
position:"absolute",
width:600,
height:600,
borderRadius:"50%",
background:"radial-gradient(circle,#06b6d455,transparent)",
bottom:"10%",
right:"15%",
filter:"blur(100px)"
}}
/>

</div>

)

}
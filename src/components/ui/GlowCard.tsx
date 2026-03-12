import { motion } from "motion/react"

export default function GlowCard({children}:any){

return(

<motion.div
animate={{
y:[0,-8,0],
scale:[1,1.03,1],
}}
transition={{
duration:5 + Math.random()*3,
repeat:Infinity
}}
style={{
borderRadius:20,
background:"linear-gradient(145deg, rgba(255,170,60,0.1), rgba(0,0,0,0))",
border:"1px solid rgba(255,200,100,0.15)"
}}
>

{children}

</motion.div>

)

}
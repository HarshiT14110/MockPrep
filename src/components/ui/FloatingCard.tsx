import { motion } from "motion/react";

export default function FloatingCard({children}:any){

return(

<motion.div
animate={{y:[0,-12,0]}}
transition={{
duration:4,
repeat:Infinity
}}
whileHover={{scale:1.05}}
style={{
padding:20,
borderRadius:16,
background:"rgba(255,255,255,0.06)",
backdropFilter:"blur(16px)",
border:"1px solid rgba(255,255,255,0.1)",
boxShadow:"0 20px 40px rgba(0,0,0,0.3)"
}}
>

{children}

</motion.div>

)

}
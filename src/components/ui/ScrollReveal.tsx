import { motion } from "motion/react";

export default function ScrollReveal({children}:any){

return(

<motion.div
initial={{opacity:0,y:60}}
whileInView={{opacity:1,y:0}}
viewport={{once:true}}
transition={{duration:0.6}}
>

{children}

</motion.div>

)

}
import { motion } from "motion/react";

export default function Hero3D({name}:{name:string}){

return(

<div
style={{
position:"relative",
height:"420px",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
marginBottom:60,
overflow:"hidden"
}}
>

{/* TEXT SIDE */}

<div style={{maxWidth:520}}>

<h1
style={{
fontSize:42,
fontWeight:700,
marginBottom:10
}}
>
Welcome back {name}
</h1>

<p style={{opacity:0.7,fontSize:16}}>
Your AI interview training hub.  
Practice smarter. Improve faster.
</p>

</div>


{/* 3D CUBE */}

<motion.div
animate={{rotateY:360}}
transition={{
duration:25,
repeat:Infinity,
ease:"linear"
}}
style={{
width:180,
height:180,
transformStyle:"preserve-3d",
position:"relative",
}}
>

{[0,1,2,3,4,5].map((i)=>(
<div
key={i}
style={{
position:"absolute",
width:"100%",
height:"100%",
background:"rgba(124,58,237,0.12)",
border:"1px solid rgba(124,58,237,0.35)",
backdropFilter:"blur(10px)",
borderRadius:10
}}
/>
))}

</motion.div>

</div>

)

}
import React,{useState} from "react";
import { motion } from "motion/react";

export default function AIOrb({T}:any){

const [open,setOpen]=useState(false)

return(

<>

<motion.div
animate={{
scale:[1,1.15,1],
boxShadow:[
"0 0 0 rgba(124,58,237,0.4)",
"0 0 30px rgba(124,58,237,0.7)",
"0 0 0 rgba(124,58,237,0.4)"
]
}}
transition={{
duration:3,
repeat:Infinity
}}
whileHover={{scale:1.25}}
onClick={()=>setOpen(!open)}
style={{
position:"fixed",
right:30,
bottom:30,
width:60,
height:60,
borderRadius:"50%",
background:T.accent,
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#fff",
fontSize:24,
cursor:"pointer",
boxShadow:"0 10px 30px rgba(0,0,0,0.4)"
}}
>
🤖
</motion.div>

{open && (

<motion.div
initial={{opacity:0,y:20}}
animate={{
scale:[1,1.1,1]
}}
transition={{
duration:2,
repeat:Infinity
}}
style={{
position:"fixed",
right:30,
bottom:100,
width:260,
padding:20,
borderRadius:16,
background:T.cardBg,
border:`1px solid ${T.cardBorder}`
}}
>

<h4>AI Coach</h4>

<p style={{fontSize:12}}>
Focus on System Design today.
Try practicing Microservices architecture questions.
</p>

</motion.div>

)}

</>

)

}
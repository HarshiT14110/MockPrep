'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Bot, Send, X } from "lucide-react"
const API = import.meta.env.VITE_API_URL || "https://mockprep-backend-0eaw.onrender.com";
export default function AIChatbot() {const token = localStorage.getItem("token");
const [open , setOpen] = useState(false)
const [messages,setMessages] = useState([
{role:"assistant",content:"Hi 👋 I'm Mocksy. Ask me anything about interviews, resume, or preparation."}
])

const [input,setInput] = useState("")
const [loading,setLoading] = useState(false)


async function sendMessage(){

if(!input.trim()) return

const newMessages=[...messages,{role:"user",content:input}]
setMessages(newMessages)
setInput("")
setLoading(true)

try{
const token = localStorage.getItem("token");

const res = await fetch(`${API}/api/chatbot`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ message: input })
})

const data = await res.json()

setMessages([...newMessages,{role:"assistant",content:data.reply}])

}catch(e){

setMessages([...newMessages,{role:"assistant",content:"Something went wrong."}])

}

setLoading(false)

}

return (

<>
{/* CHAT BUTTON */}

<motion.button
whileHover={{ scale: 1.1 }}
whileTap={{ scale: 0.95 }}
onClick={() => setOpen(true)}
style={{
position: "fixed",
bottom: 30,
right: 30,
width: 60,
height: 60,
borderRadius: "50%",
border: "none",
background: "#c9820a",
color: "#fff",
display: "flex",
alignItems: "center",
justifyContent: "center",
cursor: "pointer",
boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
zIndex: 9999
}}
>
<Bot size={28}/>
</motion.button>

{/* CHAT WINDOW */}

<AnimatePresence>
{open && (

<motion.div
initial={{ opacity: 0, y: 40, scale: 0.9 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 40, scale: 0.9 }}
style={{
position: "fixed",
bottom: 100,
right: 30,
width: 360,
height: 520,
borderRadius: 18,
background: "#1c1409",
border: "1px solid rgba(201,130,10,.2)",
display: "flex",
flexDirection: "column",
overflow: "hidden",
zIndex: 9999
}}
>

{/* HEADER */}

<div style={{
padding:"16px 18px",
display:"flex",
justifyContent:"space-between",
alignItems:"center",
borderBottom:"1px solid rgba(201,130,10,.2)"
}}>

<span style={{
fontWeight:600,
color:"#f5e6c8"
}}>
Mocksy - Your AI Interview Assistant
</span>

<button
onClick={() => setOpen(false)}
style={{
background: "none",
border: "none",
cursor: "pointer",
color: "#fff"
}}
>
<X size={18}/>
</button>
</div>

{/* MESSAGES */}

<div style={{
flex:1,
padding:16,
overflowY:"auto",
display:"flex",
flexDirection:"column",
gap:12
}}>

{messages.map((m,i)=>(

<div
key={i}
style={{
alignSelf:m.role==="user"?"flex-end":"flex-start",
maxWidth:"75%",
padding:"10px 14px",
borderRadius:12,
fontSize:13,
lineHeight:1.5,
background:m.role==="user"
? "#c9820a"
: "rgba(255,255,255,.08)",
color:"#fff"
}}
>
{m.content}
</div>

))}

{loading && (

<div style={{
fontSize:12,
color:"#aaa"
}}>
AI is thinking...
</div>

)}

</div>

{/* INPUT */}

<div style={{
padding:14,
borderTop:"1px solid rgba(201,130,10,.2)",
display:"flex",
gap:8
}}>

<input
value={input}
onChange={(e)=>setInput(e.target.value)}
placeholder="Ask anything..."
style={{
flex:1,
padding:"10px 12px",
borderRadius:10,
border:"1px solid rgba(255,255,255,.1)",
background:"rgba(255,255,255,.05)",
color:"#fff",
fontSize:13,
outline:"none"
}}
/>

<button
onClick={sendMessage}
style={{
width:40,
height:40,
borderRadius:10,
border:"none",
background:"#c9820a",
color:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center",
cursor:"pointer"
}}
>
<Send size={16}/>
</button>

</div>

</motion.div>

)}

</AnimatePresence>

</>

)

}
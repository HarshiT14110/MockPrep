import React from "react";
import { motion } from "motion/react";
import { useTheme } from "../lib/ThemeContext.js";
import { useNavigate } from "react-router-dom";

export default function BecomeProPage() {
    
    
const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [plan,setPlan] = React.useState("lifetime");

  const T = isDark
    ? {
        bg:"#130f09",
        card:"rgba(30,23,16,0.65)",
        border:"rgba(255,200,100,0.12)",
        accent:"#c9820a",
        text:"#f5e6c8",
        glow:"rgba(201,130,10,0.25)"
      }
    : {
        bg:"#faf6ef",
        card:"rgba(255,255,255,0.85)",
        border:"rgba(160,110,30,0.15)",
        accent:"#b06e08",
        text:"#1a1208",
        glow:"rgba(176,110,8,0.18)"
      };

  return (

    <div
      style={{
        minHeight:"100vh",
        background:T.bg,
        color:T.text,
        padding:60,
        position:"relative",
        overflow:"hidden"
      }}
    >


{/* BACK BUTTON */}

<motion.button
  whileHover={{ scale: 1.08 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => navigate("/dashboard")}
  style={{
    position:"absolute",
    top:30,
    left:30,
    padding:"10px 18px",
    borderRadius:10,
    border:`1px solid ${T.border}`,
    background:"transparent",
    color:T.text,
    cursor:"pointer",
    fontWeight:500
  }}
>
← Back
</motion.button>

      {/* background glow */}

      <div style={{
        position:"absolute",
        top:-200,
        left:-200,
        width:600,
        height:600,
        background:`radial-gradient(circle, ${T.glow}, transparent 70%)`,
        filter:"blur(120px)"
      }}/>

      <div style={{
        position:"absolute",
        bottom:-200,
        right:-200,
        width:600,
        height:600,
        background:`radial-gradient(circle, ${T.glow}, transparent 70%)`,
        filter:"blur(120px)"
      }}/>


      {/* floating particles */}

      {[...Array(6)].map((_,i)=>(
        <motion.div
          key={i}
          animate={{y:[0,-30,0],opacity:[0.3,0.8,0.3]}}
          transition={{duration:6+i,repeat:Infinity}}
          style={{
            position:"absolute",
            width:6,
            height:6,
            borderRadius:"50%",
            background:"#c9820a",
            boxShadow:"0 0 20px #c9820a",
            top:100 + i*120,
            left:200 + i*140
          }}
        />
      ))}


      {/* HEADER */}

      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.6}}
        style={{textAlign:"center",marginBottom:70}}
      >

        <h1
          style={{
            fontSize:52,
            fontWeight:800,
            background:"linear-gradient(90deg,#ffd37a,#c9820a)",
            WebkitBackgroundClip:"text",
            color:"transparent"
          }}
        >
          Upgrade to Pro
        </h1>

        <p style={{opacity:0.7,fontSize:17}}>
          Unlock premium AI tools and prepare like a professional.
        </p>

      </motion.div>


      {/* FEATURES GRID */}

      <div
  style={{
    display:"grid",
    gridTemplateColumns:"repeat(4,1fr)",
    gap:22,
    maxWidth:1100,
    margin:"auto",
    marginBottom:80
  }}
>

        <Feature icon="⚡" text="96 Bits included"/>
<Feature icon="🎤" text="Unlimited Interview Sessions"/>
<Feature icon="📊" text="Advanced ATS Analysis"/>
<Feature icon="📄" text="Detailed Interview Reports"/>

<div></div>
<Feature icon="🤖" text="AI Interview Assistant"/>
<Feature icon="🚀" text="Priority AI Processing"/>
<div></div>

      </div>


      {/* PRICING TOGGLE */}

      <div style={{
        display:"flex",
        justifyContent:"center",
        gap:12,
        marginBottom:40
      }}>

        <button
          onClick={()=>setPlan("monthly")}
          style={{
            padding:"10px 18px",
            borderRadius:10,
            border:`1px solid ${T.border}`,
            background:plan==="monthly"?T.accent:"transparent",
            color:T.text,
            cursor:"pointer"
          }}
        >
          Monthly
        </button>

        <button
          onClick={()=>setPlan("lifetime")}
          style={{
            padding:"10px 18px",
            borderRadius:10,
            border:`1px solid ${T.border}`,
            background:plan==="lifetime"?T.accent:"transparent",
            color:T.text,
            cursor:"pointer"
          }}
        >
          Lifetime
        </button>

      </div>


      {/* PRICING CARD */}

      <motion.div
        initial={{opacity:0,y:30}}
        animate={{opacity:1,y:0}}
        transition={{delay:0.2}}
        whileHover={{scale:1.02}}
        style={{
          maxWidth:460,
          margin:"auto",
          borderRadius:28,
          padding:50,
          background:T.card,
          border:`1px solid ${T.border}`,
          backdropFilter:"blur(30px)",
          textAlign:"center",
          position:"relative",
          overflow:"hidden"
        }}
      >

        {/* crown badge */}

        <motion.div
          animate={{y:[0,-6,0]}}
          transition={{duration:2,repeat:Infinity}}
          style={{fontSize:30,marginBottom:10}}
        >
          👑
        </motion.div>

        <h2 style={{fontSize:26,fontWeight:700}}>
          Pro Plan
        </h2>

        <p style={{
          fontSize:56,
          fontWeight:800,
          marginTop:10,
          marginBottom:20
        }}>
          {plan==="monthly" ? "₹199/mo" : "₹499"}
        </p>

        <p style={{opacity:0.7,marginBottom:30}}>
          One-time purchase to unlock premium preparation tools.
        </p>


        {/* purchase button */}

        <motion.button
          whileHover={{scale:1.07}}
          whileTap={{scale:0.95}}
          animate={{
            boxShadow:[
              "0 0 0 rgba(0,0,0,0)",
              "0 0 30px rgba(201,130,10,0.5)",
              "0 0 0 rgba(0,0,0,0)"
            ]
          }}
          transition={{duration:3,repeat:Infinity}}
          style={{
            padding:"16px 38px",
            borderRadius:14,
            border:"none",
            background:"linear-gradient(135deg,#c9820a,#e8a83a)",
            color:"#fff",
            fontWeight:700,
            fontSize:16,
            cursor:"pointer"
          }}
          onClick={()=>alert("Payment integration coming soon")}
        >
          Purchase Pro
        </motion.button>

      </motion.div>



      {/* COMPARISON TABLE */}

      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{delay:0.4}}
        style={{
          maxWidth:900,
          margin:"100px auto 0 auto",
          borderRadius:22,
          background:T.card,
          border:`1px solid ${T.border}`,
          backdropFilter:"blur(25px)",
          padding:40
        }}
      >

        <h3 style={{
          textAlign:"center",
          marginBottom:30,
          fontSize:26
        }}>
          Free vs Pro
        </h3>

        <table style={{
          width:"100%",
          borderCollapse:"collapse",
          fontSize:14
        }}>

          <tbody>

            <Row feature="Daily Bits" free="12" pro="96"/>
            <Row feature="AI Chatbot" free="Limited" pro="Unlimited"/>
            <Row feature="Interview Reports" free="Limited" pro="Full"/>
            <Row feature="ATS Analysis" free="Basic" pro="Advanced"/>
            <Row feature="Interview Practice" free="Limited" pro="Unlimited"/>

          </tbody>

        </table>

      </motion.div>

    </div>
  );
}



function Feature({icon,text}:{icon:string,text:string}){

  return(

    <motion.div
      whileHover={{
        y:-6,
        boxShadow:"0 10px 30px rgba(201,130,10,0.25)"
      }}
      style={{
        borderRadius:16,
        padding:22,
        background:"rgba(255,255,255,0.03)",
        border:"1px solid rgba(255,200,100,0.12)",
        backdropFilter:"blur(20px)",
        display:"flex",
        alignItems:"center",
        gap:12
      }}
    >

      <span style={{fontSize:22}}>{icon}</span>
      <span>{text}</span>

    </motion.div>

  );

}



function Row({feature,free,pro}:{feature:string,free:string,pro:string}){

  return(

    <tr style={{
      borderBottom:"1px solid rgba(255,200,100,0.08)"
    }}>

      <td style={{padding:12,opacity:0.8}}>{feature}</td>

      <td style={{padding:12,textAlign:"center"}}>{free}</td>

      <td style={{
        padding:12,
        textAlign:"center",
        fontWeight:600,
        color:"#c9820a"
      }}>
        {pro}
      </td>

    </tr>

  );

}
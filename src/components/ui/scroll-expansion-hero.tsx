'use client'

import { useRef, useState, useEffect } from "react"
import { motion } from "motion/react"
import { useTheme } from "../../lib/ThemeContext.js"

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image"
  mediaSrc: string
  posterSrc?: string
  bgImageSrc: string
  children?: React.ReactNode
}

export default function ScrollExpandMedia({
  mediaType = "video",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  children
}: ScrollExpandMediaProps) {

  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)

  /* HANDLE SCROLL */

  useEffect(() => {

    const handleWheel = (e: WheelEvent) => {

      if (progressRef.current < 1) {
        e.preventDefault()
      }

      const delta = e.deltaY * 0.002

      let newProgress = progressRef.current + delta

      newProgress = Math.max(0, Math.min(1, newProgress))

      progressRef.current = newProgress
      setProgress(newProgress)

    }

    window.addEventListener("wheel", handleWheel, { passive:false })

    return () => window.removeEventListener("wheel", handleWheel)

  }, [])

  /* MEDIA SCALE */

  const scale = 0.45 + progress * 0.55

  /* TEXT SPLIT */

  const textLeft = progress * -320
  const textRight = progress * 320

  /* OVERLAY */

  const overlayOpacity = 0.6 - progress * 0.6

  return (

    <div className="relative w-full">

      {/* HERO */}

      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        {/* BACKGROUND */}

        <img
          src={bgImageSrc}
          className="absolute inset-0 w-full h-full object-cover"
          alt="background"
        />

        {/* COLOR MORPH */}

        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: progress,
            backgroundColor: isDark ? "#130f09" : "#faf6ef"
          }}
        />

        {/* MEDIA */}

        <motion.div
          style={{
            transform: `translate(-50%,-50%) scale(${scale})`
          }}
          className="absolute top-1/2 left-1/2
          w-[1100px] h-[620px]
          max-w-[calc(100vw-80px)]
          max-h-[calc(100vh-80px)]
          rounded-xl overflow-hidden
          will-change-transform"
        >

          {mediaType === "video" ? (

            <video
              src={mediaSrc}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />

          ) : (

            <img
              src={mediaSrc}
              className="w-full h-full object-cover"
              alt="media"
            />

          )}

          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />

        </motion.div>

        {/* TITLE */}

        <div className="relative z-10 text-center">

          <h1
            style={{ transform:`translateX(${textLeft}px)` }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#f5e6c8] to-[#c9820a] bg-clip-text text-transparent"
          >
            Mock
          </h1>

          <h1
            style={{ transform:`translateX(${textRight}px)` }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#f5e6c8] to-[#c9820a] bg-clip-text text-transparent"
          >
            Prep
          </h1>

          <p className="text-white/70 mt-3 text-sm">
            Scroll to open dashboard
          </p>

        </div>

      </section>

      {/* DASHBOARD CONTENT */}

      <section className="max-w-6xl mx-auto px-8 pt-8 pb-24">

        {children}

      </section>

    </div>
  )
}
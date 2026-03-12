import ScrollExpandMedia from "../ui/scroll-expansion-hero.js"

export default function DashboardScrollHero(){

return(

<ScrollExpandMedia
mediaType="video"
mediaSrc="/dashboard-preview.mp4"
posterSrc="/dashboard-bgg.png"
bgImageSrc="/dashboard-bg.png"
>

<div className="text-center max-w-4xl mx-auto">

<h2 className="text-3xl font-bold mb-4">
Your AI Interview Workspace
</h2>

<p className="opacity-70">
Track progress, improve performance and prepare for interviews with AI insights.
</p>

</div>

</ScrollExpandMedia>

)

}
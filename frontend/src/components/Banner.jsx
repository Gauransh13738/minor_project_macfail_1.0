import { useState, useEffect } from "react"

function Banner() {

  // Each slide = one banner page
  const slides = [
    {
      title: "Predictive Maintenance Intelligence",
      text: "Detect machine failures before they happen using AI-driven analytics and industrial data models.",
    },
    {
      title: "Industrial Risk Monitoring",
      text: "Monitor equipment health in real-time using machine learning powered diagnostics.",
    },
    {
      title: "Smart Failure Analysis",
      text: "Combine ML predictions with ontology reasoning for deeper system insights.",
    },
  ]

  // Which slide is active
  const [current, setCurrent] = useState(0)

  // Auto change slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Manual navigation
  const nextSlide = () => {
    setCurrent((current + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrent((current - 1 + slides.length) % slides.length)
  }

  return (
    <div className="bg-gradient-to-r from-gray-950 to-gray-900 border-b border-gray-700">

      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between">

        {/* LEFT SIDE - TEXT */}
        <div className="max-w-xl">

          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {slides[current].title}
          </h2>

          <p className="text-gray-400 text-lg">
            {slides[current].text}
          </p>

          {/* Navigation buttons */}
          <div className="flex space-x-4 mt-8">
            <button
              onClick={prevSlide}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
            >
              ←
            </button>

            <button
              onClick={nextSlide}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
            >
              →
            </button>
          </div>

        </div>

        {/* RIGHT SIDE - Decorative box (future image area) */}
        <div className="mt-10 md:mt-0 w-full md:w-[400px] h-[200px] bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
          Industrial Dashboard Preview
        </div>

      </div>
    </div>
  )
}

export default Banner


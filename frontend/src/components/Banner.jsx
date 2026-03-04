import { useState, useEffect } from "react"

function Banner() {

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

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrent((current + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrent((current - 1 + slides.length) % slides.length)
  }

  return (
    <div className="py-16 bg-gray-950">

      {/* Centered banner container */}
      <div className="relative max-w-6xl mx-auto px-8 py-24 min-h-[400px] 
                rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 
                border border-gray-800 shadow-lg overflow-hidden flex items-center">

        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 
                    w-10 h-10 flex items-center justify-center 
                    rounded-full bg-gray-800 hover:bg-gray-700 
                    text-white transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 
                    w-10 h-10 flex items-center justify-center 
                    rounded-full bg-gray-800 hover:bg-gray-700 
                    text-white transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Centered Content */}
        <div className="text-center max-w-3xl mx-auto">

          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {slides[current].title}
          </h2>

          <p className="text-gray-400 text-lg">
            {slides[current].text}
          </p>

          {/* Dot indicators */}
          <div className="flex justify-center space-x-3 mt-10">
            {slides.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full cursor-pointer transition ${
                  current === index
                    ? "bg-white"
                    : "bg-gray-600"
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}

export default Banner
import { FileText } from "lucide-react"

function Documentation() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-300 space-y-10">

      <h1 className="text-3xl font-bold text-white">
        Project Documentation
      </h1>

      {/* Overview */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">
          Project Overview
        </h2>

        <p className="text-gray-400">
          This project demonstrates a predictive maintenance system for industrial
          machines using machine learning and ontology reasoning. The model predicts
          potential machine failures based on operational parameters such as air
          temperature, process temperature, torque, rotational speed, and tool wear.
        </p>
      </section>


      {/* Architecture */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">
          System Architecture
        </h2>

        <ul className="list-disc list-inside text-gray-400 space-y-2">
          <li>Machine learning model trained using the AI4I 2020 predictive maintenance dataset.</li>
          <li>Backend API built with FastAPI for prediction services.</li>
          <li>Frontend dashboard developed with React and TailwindCSS.</li>
          <li>Ontology layer used for reasoning and failure interpretation.</li>
        </ul>
      </section>


      {/* Research Paper */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold mb-6">
            Research Paper
        </h2>

        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 flex items-center justify-between">

            {/* Left side */}
            <div className="flex items-center gap-4">

                {/* PDF icon */}
                <div className="w-12 h-12 bg-red-600 flex items-center justify-center rounded-lg">
                    <FileText size={24} className="text-white" />
                </div>

                <div>
                    <h3 className="font-semibold text-white italic">
                    Predictive Maintenance using Machine Learning and Ontology
                    </h3>

                    <div className="text-gray-400 text-sm">
                        <p>Authors</p>
                        <p className="mt-1">
                            Deeksha Gupta • Gauransh Singh • Gourika Makhija
                        </p>
                        <p className="text-gray-500 mt-1">
                            Department of Information Technology • 2027
                        </p>
                    </div>
                </div>

            </div>

            {/* Right side buttons */}
            <div className="flex gap-3">

            <a
                href="/research-paper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition"
            >
                Open
            </a>

            <a
                href="/research-paper.pdf"
                download
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
            >
                Download
            </a>

            </div>

        </div>

      </section>

    </div>
  )
}

export default Documentation
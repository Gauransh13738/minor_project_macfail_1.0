import { useState } from "react"
import PredictionModule from "./PredictionModule"
import AnalyticsModule from "./AnalyticsModule"

function Tools() {

  const [activeTab, setActiveTab] = useState("prediction")
  const [history, setHistory] = useState([])

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      
      <h1 className="text-3xl font-bold mb-10">
        Tools Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        {/* Total Predictions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">
            Total Predictions
          </p>

          <p className="text-3xl font-bold">
            {history.length}
          </p>
        </div>


        {/* Failure Rate */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">
            Failure Rate
          </p>

          <p className="text-3xl font-bold text-red-400">
            {history.length === 0
              ? "0%"
              : Math.round(
                  (history.filter(h => h.failure_class !== 0).length /
                    history.length) * 100
                ) + "%"}
          </p>
        </div>


        {/* Last Prediction */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">
            Last Prediction
          </p>

          <p className="text-lg font-semibold text-yellow-400">
            {history.length === 0
              ? "No predictions yet"
              : history[0].failure_type}
          </p>
       </div>

      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-800 mb-10">

        <button
          onClick={() => setActiveTab("prediction")}
          className={`pb-3 transition ${
            activeTab === "prediction"
              ? "border-b-2 border-white text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Prediction
        </button>

        <button
          onClick={() => setActiveTab("analysis")}
          className={`pb-3 transition ${
            activeTab === "analysis"
              ? "border-b-2 border-white text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Analysis
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 transition ${
            activeTab === "history"
              ? "border-b-2 border-white text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          History
        </button>

      </div>

      {/* Dynamic Content Area */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">

        {activeTab === "prediction" && (
          <PredictionModule setHistory={setHistory} />
        )}
        
        {activeTab === "analysis" && (
          <AnalyticsModule history={history} />
        )}

        {activeTab === "history" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Prediction History
            </h2>

            {history.length === 0 ? (
              <p className="text-gray-400">No predictions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border border-gray-800">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Air Temp</th>
                      <th className="px-4 py-2">Process Temp</th>
                      <th className="px-4 py-2">Speed</th>
                      <th className="px-4 py-2">Torque</th>
                      <th className="px-4 py-2">Tool Wear</th>
                      <th className="px-4 py-2">Failure Type</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((item, index) => (
                      <tr key={index} className="border-t border-gray-800">
                        <td className="px-4 py-2">{item.timestamp}</td>
                        <td className="px-4 py-2">{item.Type}</td>
                        <td className="px-4 py-2">{item.Air_temperature_K}</td>
                        <td className="px-4 py-2">{item.Process_temperature_K}</td>
                        <td className="px-4 py-2">{item.Rotational_speed_rpm}</td>
                        <td className="px-4 py-2">{item.Torque_Nm}</td>
                        <td className="px-4 py-2">{item.Tool_wear_min}</td>
                        <td className="px-4 py-2">{item.failure_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  )
}

export default Tools

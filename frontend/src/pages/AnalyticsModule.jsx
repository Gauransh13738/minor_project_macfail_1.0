import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from "recharts"

function AnalyticsModule({ history }) {

  // -------- FAILURE TYPE DISTRIBUTION --------
  const failureCounts = {}

  history.forEach(item => {
    const type = item.failure_type
    failureCounts[type] = (failureCounts[type] || 0) + 1
  })

  const failureData = Object.keys(failureCounts).map(type => ({
    failure: type,
    count: failureCounts[type]
  }))

  // -------- TORQUE vs FAILURE --------
  const torqueData = history.map(item => ({
    torque: Number(item.Torque_Nm),
    failure: Number(item.failure_class)
  }))

  const torqueBuckets = {
    "0-40": 0,
    "40-80": 0,
    "80-120": 0,
    "120+": 0
  }

  history.forEach(item => {
    const torque = Number(item.Torque_Nm)

    if (torque < 40) torqueBuckets["0-40"]++
    else if (torque < 80) torqueBuckets["40-80"]++
    else if (torque < 120) torqueBuckets["80-120"]++
    else torqueBuckets["120+"]++
  })

  const torqueBarData = Object.keys(torqueBuckets).map(range => ({
    range,
    count: torqueBuckets[range]
  }))

  // -------- TOOL WEAR vs FAILURE --------
  const wearData = history
    .map(item => ({
        wear: Number(item.Tool_wear_min),
        failure: Number(item.failure_class)
    }))
    .sort((a, b) => a.wear - b.wear)

  // -------- TEMP DIFFERENCE vs FAILURE --------
  const tempDiffData = history.map(item => ({
    diff: item.Process_temperature_K - item.Air_temperature_K,
    failure: Number(item.failure_class)
  }))

  const tempBuckets = {
    "0-10K": 0,
    "10-20K": 0,
    "20-30K": 0,
    "30K+": 0
  }

  history.forEach(item => {
    const diff =
        Number(item.Process_temperature_K) -
        Number(item.Air_temperature_K)

    if (diff < 10) tempBuckets["0-10K"]++
    else if (diff < 20) tempBuckets["10-20K"]++
    else if (diff < 30) tempBuckets["20-30K"]++
    else tempBuckets["30K+"]++
  })

  const tempBarData = Object.keys(tempBuckets).map(range => ({
    range,
    count: tempBuckets[range]
  }))

  if (history.length === 0) {
    return (
      <p className="text-gray-400">
        Run some predictions to generate analytics.
      </p>
    )
  }

  return (
    <div className="space-y-12">

         {/* Failure Class Reference */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Failure Class Reference</h2>

            <p className="text-gray-400 mb-4">
                Each prediction returns a failure class representing a specific machine issue.
            </p>

            <ul className="grid md:grid-cols-2 gap-2 text-gray-300 text-sm">
                <li><span className="font-semibold text-green-400">0:</span> No Failure</li>
                <li><span className="font-semibold">1:</span> Tool Wear Failure</li>
                <li><span className="font-semibold">2:</span> Heat Dissipation Failure</li>
                <li><span className="font-semibold">3:</span> Power Failure</li>
                <li><span className="font-semibold">4:</span> Overstrain Failure</li>
                <li><span className="font-semibold">5:</span> Random Failure</li>
            </ul>
        </div>


        <div className="grid md:grid-cols-2 gap-6">
            {/* Failure Rate */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3">Machine Failure Rate</h2>

                <p className="text-gray-400 text-sm mb-4">
                Percentage of predictions that resulted in machine failure.
                </p>

                {history.length > 0 && (
                <div className="text-4xl font-bold text-red-400">
                    {Math.round(
                    (history.filter(h => h.failure_class !== 0).length / history.length) * 100
                    )}%
                </div>
                )}

                <p className="text-gray-500 mt-2 text-sm">
                Based on {history.length} predictions
                </p>
            </div>


            {/* Most Common Failure */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3">Most Common Failure</h2>

                <p className="text-gray-400 text-sm mb-4">
                Failure type occurring most frequently in predictions.
                </p>

                {history.length > 0 && (
                <div className="text-2xl font-bold text-yellow-400">
                    {
                    Object.entries(
                        history.reduce((acc, item) => {
                        acc[item.failure_type] = (acc[item.failure_type] || 0) + 1
                        return acc
                        }, {})
                    ).sort((a,b)=>b[1]-a[1])[0][0]
                    }
                </div>
                )}
            </div>

        </div>

      {/* Failure Distribution */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Failure Type Distribution
        </h2>

        <p className="text-gray-400 mb-6">
          This chart shows how often each type of machine failure occurs.
          It helps identify the most common failure mode.
        </p>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={failureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="failure" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Torque vs Failure */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
            Torque Load Distribution
        </h2>

        <p className="text-gray-400 mb-6">
            Shows how machine predictions are distributed across torque load ranges.
        </p>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={torqueBarData}>
                <CartesianGrid stroke="#444" />
                <XAxis dataKey="range" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Temperature Difference vs Failure */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
            Temperature Difference Impact
        </h2>

        <p className="text-gray-400 mb-6">
            Shows how the difference between process and air temperature varies across predictions.
        </p>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tempBarData}>
                <CartesianGrid stroke="#444" />
                <XAxis dataKey="range" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="count" fill="#0bf59b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Tool Wear vs Failure */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Tool Wear vs Failure
        </h2>

        <p className="text-gray-400 mb-6">
          This plot shows how increasing tool wear correlates with machine failures.
          Higher wear values often indicate tools approaching end-of-life.
        </p>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="wear" name="Tool Wear" stroke="#aaa" />
              <YAxis dataKey="failure" name="Failure Class" stroke="#aaa" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={wearData} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}

export default AnalyticsModule
import { useState } from "react"

function PredictionModule({ setHistory }) {

  const [formData, setFormData] = useState({
    Type: "M",
    Air_temperature_K: "",
    Process_temperature_K: "",
    Rotational_speed_rpm: "",
    Torque_Nm: "",
    Tool_wear_min: ""
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [predictionCount, setPredictionCount] = useState(0)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          Air_temperature_K: Number(formData.Air_temperature_K),
          Process_temperature_K: Number(formData.Process_temperature_K),
          Rotational_speed_rpm: Number(formData.Rotational_speed_rpm),
          Torque_Nm: Number(formData.Torque_Nm),
          Tool_wear_min: Number(formData.Tool_wear_min)
        })
      })

      const data = await response.json()
      setResult(data)
      setPredictionCount(prev => prev + 1)

      setHistory(prev => [
       {
        ...formData,
        ...data,
        timestamp: new Date().toLocaleString()
       },
        ...prev
      ])

      setFormData({
        Type: "M",
        Air_temperature_K: "",
        Process_temperature_K: "",
        Rotational_speed_rpm: "",
        Torque_Nm: "",
        Tool_wear_min: ""
      })

    } catch (error) {
      console.error("Prediction error:", error)
    }

    setLoading(false)
  }

  return (
    <div>

      <h2 className="text-xl font-semibold mb-6">
        Machine Failure Prediction
      </h2>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">

        {/* Type */}
        <div>
          <label className="block text-gray-400 mb-2">Type</label>
          <select
            name="Type"
            value={formData.Type}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
          >
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="H">H</option>
          </select>
        </div>

        {/* Air Temperature */}
        <InputField label="Air Temperature (K)" name="Air_temperature_K" value={formData.Air_temperature_K} onChange={handleChange} />

        <InputField label="Process Temperature (K)" name="Process_temperature_K" value={formData.Process_temperature_K} onChange={handleChange} />

        <InputField label="Rotational Speed (rpm)" name="Rotational_speed_rpm" value={formData.Rotational_speed_rpm} onChange={handleChange} />

        <InputField label="Torque (Nm)" name="Torque_Nm" value={formData.Torque_Nm} onChange={handleChange} />

        <InputField label="Tool Wear (min)" name="Tool_wear_min" value={formData.Tool_wear_min} onChange={handleChange} />

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded hover:bg-gray-200 transition"
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Running Prediction...
              </span>
            ) : (
              "Run Prediction"
            )}
          </button>
        </div>

      </form>

      {/* Result Display */}
      {result && (
        <div className="mt-10">

            <div className={`p-8 rounded-xl border 
            ${result.failure_class === 0 
                ? "bg-green-900/20 border-green-700" 
                : "bg-red-900/20 border-red-700"
            }`}>

            <h3 className="text-xl font-semibold mb-4">
            Prediction #{predictionCount}
            </h3>

            <p className="text-gray-400 text-sm mb-4">
            Generated at {new Date().toLocaleString()}
            </p>

            <div className="flex items-center justify-between">

                <div>
                <p className="text-gray-400 text-sm mb-2">
                    Failure Type
                </p>

                <p className={`text-2xl font-bold 
                    ${result.failure_class === 0 
                    ? "text-green-400" 
                    : "text-red-400"
                    }`}>
                    {result.failure_type}
                </p>
                </div>

                <div className="text-right">
                <p className="text-gray-400 text-sm mb-2">
                    Failure Class
                </p>

                <span className={`px-4 py-2 rounded-full text-sm font-semibold
                    ${result.failure_class === 0
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                    }`}>
                    Class {result.failure_class}
                </span>
                </div>

            </div>

            </div>

        </div>
      )}
    </div>
  )
}

function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-gray-400 mb-2">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
        required
      />
    </div>
  )
}

export default PredictionModule
import { Download } from "lucide-react"
import { toneOf } from "./constants"
import { summaryFor } from "./explain"
import { sentence } from "./format"

export default function Verdict({ result, onExport }) {
  const tone = toneOf(result.failure_type)

  return (
    <section aria-labelledby="verdict-title" className={`border-t-2 pt-6 ${tone.edge}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <span className={`size-2 rounded-full ${tone.dot}`} />
            {tone.label}
          </p>
          <h2 id="verdict-title" className="display mt-3 text-4xl text-gray-50 sm:text-5xl">
            {sentence(result.failure_type)}
          </h2>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-3.5 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-gray-500 hover:text-gray-50"
        >
          <Download size={16} aria-hidden="true" />
          Export report
        </button>
      </div>
      <p className="mt-5 max-w-[64ch] text-base leading-relaxed text-gray-300">{summaryFor(result)}</p>
    </section>
  )
}

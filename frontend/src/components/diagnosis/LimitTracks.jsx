import { useEffect, useState } from "react"
import { FEATURES, FEATURE_ORDER, SEVERITY, TONE } from "./constants"
import { firesWhen } from "./explain"
import { num, sentence } from "./format"

// The marker slides in from the left edge once, when a result first appears.
function useArrived() {
  const [arrived, setArrived] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setArrived(true), 40)
    return () => clearTimeout(id)
  }, [])
  return arrived
}

/**
 * One reading drawn against its rule limits.
 *   regions: [{ operator, threshold, met }]  the zones where a rule condition holds
 * Hatched = the zone where the rule fires. The marker turns the tone colour when the
 * reading is inside such a zone.
 */
export function LimitTrack({ feature, value, regions, tone = "warn", suffix = "", showStatus = true }) {
  const meta = FEATURES[feature] ?? { label: feature, unit: "", domain: [0, value * 1.5], digits: 0 }
  const thresholds = regions.map((r) => r.threshold)
  const lo = Math.min(meta.domain[0], value, ...thresholds)
  const hi = Math.max(meta.domain[1], value, ...thresholds)
  const at = (v) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100))
  const labelAt = (v) => Math.min(92, Math.max(8, at(v)))

  const arrived = useArrived()
  const crossed = regions.some((r) => r.met)
  const t = TONE[tone]
  const unit = meta.unit

  const summary =
    `${meta.label}${suffix}: ${num(value, meta.digits)} ${unit}. ` +
    regions.map((r) => `Limit ${r.operator === "<" ? "below" : "above"} ${num(r.threshold, meta.digits)} ${unit}`).join(", ") +
    `. ${crossed ? "Limit crossed." : "Within limit."}`

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-gray-300">{meta.label}{suffix}</span>
        {showStatus && (
          <span className={`text-sm ${crossed ? `${t.text} font-medium` : "text-gray-500"}`}>
            {crossed ? "Limit crossed" : "Within limit"}
          </span>
        )}
      </div>

      <div role="img" aria-label={summary} className="relative mx-3 mt-1 h-[68px]">
        {/* limit labels sit above the track */}
        {regions.map((r, i) => (
          <span
            key={`l${i}`}
            className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-xs text-gray-400 tabular-nums"
            style={{ left: `${labelAt(r.threshold)}%` }}
          >
            {r.operator} {num(r.threshold, meta.digits)} {unit}
          </span>
        ))}

        {/* the track, with hatched fault zones */}
        <div className="absolute inset-x-0 top-[26px] h-2 overflow-hidden rounded-full bg-gray-800">
          {regions.map((r, i) => (
            <div
              key={`z${i}`}
              className="hatch absolute inset-y-0 opacity-70"
              style={{
                color: t.hex,
                ...(r.operator === "<" || r.operator === "<="
                  ? { left: 0, width: `${at(r.threshold)}%` }
                  : { left: `${at(r.threshold)}%`, right: 0 }),
              }}
            />
          ))}
        </div>

        {/* limit ticks */}
        {regions.map((r, i) => (
          <span key={`t${i}`} className="absolute top-[22px] h-4 w-px bg-gray-300" style={{ left: `${at(r.threshold)}%` }} />
        ))}

        {/* the reading */}
        <span
          className="absolute top-[23px] size-3.5 -translate-x-1/2 rounded-full border-2 border-gray-950 transition-[left] duration-700 ease-out"
          style={{ left: `${arrived ? at(value) : 0}%`, backgroundColor: crossed ? t.hex : "#E8EEF4" }}
        />
        <span
          className="absolute top-11 -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-gray-50 tabular-nums transition-[left] duration-700 ease-out"
          style={{ left: `${arrived ? labelAt(value) : 8}%` }}
        >
          {num(value, meta.digits)} {unit}
        </span>
      </div>
    </div>
  )
}

function buildGroups(checks) {
  const byMode = new Map()
  for (const rule of checks) {
    if (!byMode.has(rule.failure_type)) byMode.set(rule.failure_type, [])
    byMode.get(rule.failure_type).push(rule)
  }

  return [...byMode].map(([failureType, rules]) => {
    const tracks = new Map()
    for (const rule of rules) {
      for (const c of rule.conditions) {
        if (!tracks.has(c.feature)) tracks.set(c.feature, { feature: c.feature, value: c.value, regions: [] })
        tracks.get(c.feature).regions.push({ operator: c.operator, threshold: c.threshold, met: c.met })
      }
    }

    const fired = rules.some((r) => r.fired)
    // For rules with several conditions that must all hold, say how many do.
    const multi = rules.filter((r) => r.conditions.length > 1)
    const partial = !fired && multi.length > 0
      ? Math.max(...multi.map((r) => r.conditions.filter((c) => c.met).length))
      : 0
    const needed = multi[0]?.conditions.length ?? 0

    return {
      failureType,
      rules,
      fired,
      partial,
      needed,
      tracks: [...tracks.values()].sort((a, b) => FEATURE_ORDER.indexOf(a.feature) - FEATURE_ORDER.indexOf(b.feature)),
    }
  })
}

function GroupStatus({ group, tone }) {
  const t = TONE[tone]
  if (group.fired) {
    return (
      <p className={`flex items-center gap-2 text-sm font-medium ${t.text}`}>
        <span className={`size-2 rounded-full ${t.dot}`} />
        Rule fired
      </p>
    )
  }
  if (group.partial > 0) {
    return <p className="text-sm text-gray-300">{group.partial} of {group.needed} conditions met</p>
  }
  return <p className="text-sm text-gray-500">Within limits</p>
}

export default function LimitTracks({ checks = [], machineType }) {
  if (checks.length === 0) return null
  const groups = buildGroups(checks)

  return (
    <section aria-labelledby="limits-title" className="mt-12">
      <h3 id="limits-title" className="text-lg font-semibold text-gray-50">Readings against rule limits</h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-gray-400">
        Each ontology rule is a limit on a reading calculated from your inputs.
        <span className="inline-flex items-center gap-1.5">
          <span className="hatch inline-block h-2.5 w-5 rounded-sm text-gray-400" aria-hidden="true" />
          Hatched areas are where a rule fires.
        </span>
      </p>

      <ul className="mt-5 divide-y divide-gray-800 rounded-lg border border-gray-800 bg-gray-900 px-5">
        {groups.map((group) => {
          const tone = SEVERITY[group.failureType] === "crit" ? "crit" : "warn"
          return (
            <li key={group.failureType} className="py-6">
              <div className="flex items-baseline justify-between gap-4">
                <h4 className="font-semibold text-gray-50">{sentence(group.failureType)}</h4>
                <GroupStatus group={group} tone={tone} />
              </div>
              <p className="mt-1 text-sm text-gray-400">{firesWhen(group.rules, machineType)}</p>
              <div className="mt-4 space-y-4">
                {group.tracks.map((track) => (
                  <LimitTrack
                    key={track.feature}
                    feature={track.feature}
                    value={track.value}
                    regions={track.regions}
                    tone={tone}
                    showStatus={group.tracks.length > 1}
                    suffix={track.feature === "wear_torque" && machineType ? ` (type ${machineType})` : ""}
                  />
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

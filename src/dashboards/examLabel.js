/** An exam on a chart's axis. Names repeat every cycle: with several cycles the label says which. */
export function examLabel(point, includeAllCycles) {
  return includeAllCycles ? `${point.examName} · ${point.cycleName}` : point.examName;
}

function getPhase(item) {
  const knife = PATTERNS[item.item_name];
  if (!knife) return null;
  return knife[item.paint_index] ?? knife[ANY] ?? null;
}

function getTier(item) {
  const phase = getPhase(item);
  if (!phase) return null;
  for (const tier of Object.keys(phase.tiers)) {
    if (phase.tiers[tier].includes(item.paint_seed)) return tier;
  }
  return null;
}

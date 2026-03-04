function getPhase(item) {
  if (!item || !item.def_index || !item.paint_index) return null;

  const weapon = PATTERNS[item.def_index];
  if (!weapon) return null;

  return weapon[item.paint_index] ?? null;
}

function getTier(item) {
  const phase = getPhase(item);
  if (!phase) return null;
  for (const tier of Object.keys(phase.tiers)) {
    if (phase.tiers[tier].includes(item.paint_seed)) return tier;
  }
  return null;
}

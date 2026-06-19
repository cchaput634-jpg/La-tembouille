CREATE TABLE IF NOT EXISTS figurations (
  id TEXT PRIMARY KEY,
  cours TEXT NOT NULL,
  titre TEXT NOT NULL,
  deroule TEXT NOT NULL DEFAULT '',
  info_a_savoir TEXT NOT NULL DEFAULT '',
  type_ped TEXT NOT NULL DEFAULT '',
  item_a_demander TEXT NOT NULL DEFAULT '',
  lieu TEXT NOT NULL DEFAULT '',
  autre TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_figurations_cours ON figurations(cours);
CREATE INDEX IF NOT EXISTS idx_figurations_updated ON figurations(updated_at DESC);

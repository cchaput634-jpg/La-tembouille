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

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  heure TEXT NOT NULL CHECK (heure IN ('21:00', '21:45')),
  cours TEXT NOT NULL,
  professeur TEXT NOT NULL DEFAULT '',
  gerant_figuration TEXT NOT NULL DEFAULT '',
  nombre_figurants INTEGER,
  figuration_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('mapping_only', 'figuration_only', 'tp_figuration')),
  motif_retard TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_cours ON events(cours);

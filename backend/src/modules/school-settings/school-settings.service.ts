import { query } from '../../config/database';
import { cache } from '../../config/redis';

const CACHE_KEY = 'school:settings';

export async function getSettings() {
  const cached = await cache.get<Record<string, unknown>>(CACHE_KEY);
  if (cached) return cached;

  const result = await query('SELECT * FROM school_settings ORDER BY created_at LIMIT 1');
  const settings = result.rows[0] ?? null;
  if (settings) await cache.set(CACHE_KEY, settings, 600);
  return settings;
}

export async function updateSettings(data: Record<string, unknown>) {
  const allowed = [
    'school_name', 'school_name_hindi', 'logo_url', 'primary_color', 'secondary_color',
    'tagline', 'address', 'city', 'state', 'phone', 'email', 'website',
    'affiliation', 'established_year',
  ];

  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => allowed.includes(k) && data[k] !== undefined)
  );

  const keys = Object.keys(filtered);
  if (keys.length === 0) return getSettings();

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = Object.values(filtered);

  const result = await query(
    `UPDATE school_settings SET ${setClause}, updated_at = NOW()
     WHERE id = (SELECT id FROM school_settings ORDER BY created_at LIMIT 1)
     RETURNING *`,
    values
  );

  await cache.del(CACHE_KEY);
  return result.rows[0];
}

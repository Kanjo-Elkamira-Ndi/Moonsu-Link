import { pool } from '../db/pool';
import { t } from '../config/templates';
import type { Lang } from '../config/templates';
import { messageRouter } from './messageRouter.service';

function makeId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export const listingsService = {
  async create({
    userId,
    crop,
    quantityKg,
    town,
    priceFcfa,
    lang,
  }: {
    userId: string;
    crop: string;
    quantityKg: number;
    town: string;
    priceFcfa: number;
    lang: Lang;
  }): Promise<string> {
    // Enforce max 5 active listings
    const { rows: active } = await pool.query(
      `SELECT COUNT(*) FROM listings WHERE farmer_id = $1 AND status = 'active' AND expires_at > NOW()`,
      [userId],
    );
    if (Number(active[0].count) >= 5) return t.maxListings[lang];

    const id = makeId();
    await pool.query(
      `INSERT INTO listings (id, farmer_id, crop, quantity_kg, town, price_fcfa)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userId, crop, quantityKg, town, priceFcfa],
    );

    // Notify buyers who have alerts for this crop/region
    void notifyAlertSubscribers(crop, town, id);

    return (t.listingCreated[lang] as Function)(id, crop, quantityKg, town, priceFcfa);
  },

  async search({
    crop,
    town,
    lang,
  }: {
    crop: string;
    town?: string;
    lang: Lang;
  }): Promise<string> {
    const params: unknown[] = [`%${crop}%`];
    let query = `
      SELECT l.id, l.crop, l.quantity_kg, l.town, l.price_fcfa
      FROM listings l
      WHERE l.status = 'active'
        AND l.expires_at > NOW()
        AND l.crop ILIKE $1
    `;
    if (town) {
      params.push(`%${town}%`);
      query += ` AND l.town ILIKE $${params.length}`;
    }
    query += ` ORDER BY l.created_at DESC LIMIT 5`;

    const { rows } = await pool.query(query, params);
    if (rows.length === 0) return t.listingNotFound[lang];

    const lines = rows.map((r) =>
      (t.listingResult[lang] as Function)(r.id, r.crop, r.quantity_kg, r.town, r.price_fcfa, ''),
    );
    return lines.join('\n---\n');
  },

  async connect({
    buyerId,
    listingId,
    lang,
  }: {
    buyerId: string;
    listingId: string;
    lang: Lang;
  }): Promise<string> {
    const { rows } = await pool.query(
      `SELECT l.id, l.crop, l.farmer_id, u.phone, u.channel, u.lang
       FROM listings l JOIN users u ON u.id = l.farmer_id
       WHERE l.id = $1 AND l.status = 'active' AND l.expires_at > NOW()`,
      [listingId],
    );
    if (rows.length === 0) return t.listingNotFound[lang];

    const listing = rows[0];

    // Save connection request
    await pool.query(
      `INSERT INTO connection_requests (listing_id, buyer_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [listingId, buyerId],
    );

    // Get buyer phone to notify farmer
    const { rows: buyerRows } = await pool.query(`SELECT phone FROM users WHERE id = $1`, [buyerId]);
    const buyerPhone = buyerRows[0]?.phone ?? 'unknown';

    // Notify farmer
    const farmerMsg = (t.connectionNotification[listing.lang as Lang] as Function)(
      listing.crop,
      buyerPhone,
    );
    void messageRouter({
      channel: listing.channel,
      from: listing.phone,
      text: `__NOTIFY__ ${farmerMsg}`,
      raw: null,
    });

    return (t.connectionSent[lang] as Function)(listingId);
  },

  async myListings({ userId, lang }: { userId: string; lang: Lang }): Promise<string> {
    const { rows } = await pool.query(
      `SELECT id, crop, quantity_kg, town, price_fcfa
       FROM listings
       WHERE farmer_id = $1 AND status = 'active' AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId],
    );
    if (rows.length === 0) return t.listingNotFound[lang];

    const header = (t.myListings[lang] as Function)(rows.length);
    const lines = rows.map(
      (r) => `${r.id}: ${r.crop} ${r.quantity_kg}kg ${r.town} ${r.price_fcfa}FCFA/kg`,
    );
    return [header, ...lines].join('\n');
  },

  async cancel({
    userId,
    listingId,
    lang,
  }: {
    userId: string;
    listingId: string;
    lang: Lang;
  }): Promise<string> {
    const { rowCount } = await pool.query(
      `UPDATE listings SET status = 'cancelled'
       WHERE id = $1 AND farmer_id = $2 AND status = 'active'`,
      [listingId, userId],
    );
    if (!rowCount) return t.listingNotFound[lang];
    return (t.listingCancelled[lang] as Function)(listingId);
  },
};

async function notifyAlertSubscribers(crop: string, town: string, listingId: string) {
  try {
    const { rows } = await pool.query(
      `SELECT u.phone, u.channel, u.lang, ba.region
       FROM buyer_alerts ba JOIN users u ON u.id = ba.user_id
       WHERE ba.crop ILIKE $1 AND ba.active = TRUE
         AND ($2 ILIKE '%' || ba.region || '%' OR ba.region IS NULL)`,
      [crop, town],
    );

    for (const sub of rows) {
      const msg =
        sub.lang === 'fr'
          ? `Nouvelle annonce: ${crop} disponible. ID: ${listingId}. Repondre: INTERESSE ${listingId}`
          : `New listing: ${crop} available near you. ID: ${listingId}. Reply: INTERESTED ${listingId}`;

      void messageRouter({ channel: sub.channel, from: sub.phone, text: `__NOTIFY__ ${msg}`, raw: null });
    }
  } catch (err) {
    console.error('[Alerts] Notify failed:', err);
  }
}

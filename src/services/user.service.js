const redis = require("../config/redis");
const db = require("../config/database");

const CACHE_PREFIX = "user:";
const CACHE_TTL = 300; // 5 minutes

module.exports = {
  /**
   * Récupère un utilisateur par son MSISDN
   * 1. Cherche dans Redis
   * 2. Si absent, va chercher dans Postgres
   * 3. Met en cache dans Redis
   */
  async findByMsisdn(msisdn) {
    if (!msisdn) return null;

    const cacheKey = `${CACHE_PREFIX}${msisdn}`;

    try {
      // 1️⃣ Chercher dans Redis
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // 2️⃣ Chercher dans Postgres
      const { rows } = await db.query(
        "SELECT id, msisdn, first_name, last_name, lang FROM users WHERE msisdn = $1",
        [msisdn]
      );

      if (!rows.length) return null;

      const user = rows[0];

      // 3️⃣ Mettre en cache Redis
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(user));

      return user;

    } catch (err) {
      console.error("Error fetching user:", err);
      return null;
    }
  },

  /**
   * Crée un utilisateur
   */
  async create({ msisdn, firstName, lastName, lang = "fr" }) {
    try {
      const { rows } = await db.query(
        `INSERT INTO users (msisdn, first_name, last_name, lang)
         VALUES ($1, $2, $3, $4)
         RETURNING id, msisdn, first_name, last_name, lang`,
        [msisdn, firstName, lastName, lang]
      );

      const user = rows[0];

      // mettre en cache Redis
      await redis.setex(`${CACHE_PREFIX}${msisdn}`, CACHE_TTL, JSON.stringify(user));

      return user;
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  }
};

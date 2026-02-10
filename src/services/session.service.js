const redis = require("../config/redis");
const { sessionTtl } = require("../config");

const PREFIX = "session:";

module.exports = {
  /**
   * Récupérer une session par ID
   */
  async get(sessionId) {
    if (!sessionId) return null;

    try {
      const data = await redis.get(PREFIX + sessionId);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Redis get session error:", err);
      return null;
    }
  },

  /**
   * Créer ou récupérer une session
   */
  async getOrCreate(sessionId) {
    let session = await this.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        page: "START",   // page initiale
        userId: null,
        data: {},
        createdAt: Date.now()
      };
      await this.update(sessionId, session);
    }
    return session;
  },

  /**
   * Mettre à jour la session
   */
  async update(sessionId, session) {
    try {
      await redis.setex(PREFIX + sessionId, sessionTtl, JSON.stringify(session));
    } catch (err) {
      console.error("Redis update session error:", err);
    }
  },

  /**
   * Supprimer une session (fin de session)
   */
  async delete(sessionId) {
    try {
      await redis.del(PREFIX + sessionId);
    } catch (err) {
      console.error("Redis delete session error:", err);
    }
  }
};

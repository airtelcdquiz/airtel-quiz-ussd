// src/services/user.service.js
module.exports = {
  async findByMsisdn(msisdn) {
    // 1. vérifier cache Redis
    // 2. fallback DB
    // 3. retourner null si inexistant
    return null;
  }
};
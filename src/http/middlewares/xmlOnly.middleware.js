module.exports = function xmlOnly(req, res, next) {
  if (req.method !== "POST") return next();

  const ct = (req.headers["content-type"] || "").toLowerCase();

  if (!ct.includes("xml")) {
    return res.status(415).send("XML only");
  }

  next();
};

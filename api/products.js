module.exports = async (req, res) => (await import('../server/core.mjs')).handle(req, res);

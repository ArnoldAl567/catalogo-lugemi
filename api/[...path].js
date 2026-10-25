module.exports = async function handler(req, res) {
  const { handle } = await import('../server/core.mjs');
  return handle(req, res);
};

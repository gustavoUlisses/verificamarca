export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { termo } = req.query;

  if (!termo || termo.trim().length < 2) {
    return res.status(400).json({ error: 'Digite pelo menos 2 caracteres.' });
  }

  // Rate limit básico por IP (memória — reseta a cada deploy)
  if (!global._rl) global._rl = {};
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const b = global._rl[ip] || { n: 0, t: now };
  if (now - b.t > 60_000) { b.n = 0; b.t = now; }
  b.n++;
  global._rl[ip] = b;
  if (b.n > 20) {
    return res.status(429).json({ error: 'Muitas requisições. Aguarde 1 minuto.' });
  }

  try {
    const url = 'https://servicos.busca.inpi.gov.br/api/v2/marcas/pesquisa?' +
      new URLSearchParams({ term: termo.trim(), start: 0, rows: 20 });

    const upstream = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; VerificaMarca/1.0)',
        'Referer': 'https://servicos.busca.inpi.gov.br/marcas',
        'Origin': 'https://servicos.busca.inpi.gov.br',
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `INPI retornou erro ${upstream.status}.` });
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);

  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'O INPI demorou demais. Tente novamente.' });
    }
    console.error('[busca]', err);
    return res.status(502).json({ error: 'Não foi possível consultar o INPI.' });
  }
}

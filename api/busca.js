export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { termo } = req.query;

  if (!termo || termo.trim().length < 2) {
    return res.status(400).json({ error: 'Digite pelo menos 2 caracteres.' });
  }

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
    const url = 'https://pi-api-dev.ibict.br/api/trademarks/search';

    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: termo.trim(),
        page: 0,
        size: 20,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `INPI retornou erro ${upstream.status}.` });
    }

    const data = await upstream.json();

    const hits = (data.results || []).map(r => ({
      _source: {
        nomeMarca: r.mark_name?.raw || '',
        descricaoSituacao: r.status?.raw || '',
        descricaoNatureza: r.nature_text?.raw || '',
        nomeTitular: r.holders?.raw?.[0]?.name || '',
        dataDeposito: r.filing_date?.raw ? r.filing_date.raw.split('T')[0] : '',
        dataVigencia: r.validity_date?.raw ? r.validity_date.raw.split('T')[0] : '',
        numeroProcesso: r.process_number?.raw || '',
        apresentacao: r.presentation_text?.raw || '',
      },
    }));

    const result = {
      hits: {
        hits,
        total: { value: data.totalResults || hits.length },
      },
    };

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(result);

  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'O INPI demorou demais. Tente novamente.' });
    }
    console.error('[busca]', err);
    return res.status(502).json({ error: 'Não foi possível consultar o INPI.' });
  }
}

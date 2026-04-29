// netlify/functions/points.js
// Handles GET /api/points, POST /api/points, PUT /api/points?id=..., DELETE /api/points?id=...

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  try {
    // ── GET: fetch all points ──────────────────────────
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    // ── POST: add a point ─────────────────────────────
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, v, fa, g, v_pkg, fa_pkg, g_pkg, color, size } = body;

      const { data, error } = await supabase
        .from('points')
        .insert([{ name, v, fa, g, v_pkg, fa_pkg, g_pkg, color, size }])
        .select()
        .single();

      if (error) throw error;
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify(data) };
    }

    // ── PUT: update a point ───────────────────────────
    if (event.httpMethod === 'PUT') {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing id' }) };

      const body = JSON.parse(event.body || '{}');
      const { name, v, fa, g, v_pkg, fa_pkg, g_pkg, color, size } = body;

      const { data, error } = await supabase
        .from('points')
        .update({ name, v, fa, g, v_pkg, fa_pkg, g_pkg, color, size })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    // ── DELETE: remove a point by id ──────────────────
    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing id' }) };

      const { error } = await supabase.from('points').delete().eq('id', id);
      if (error) throw error;
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};

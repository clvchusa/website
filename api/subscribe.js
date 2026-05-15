export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, phone, city, source } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email' });
  }

  const payload = {
    email,
    attributes: {
      SMS:    phone  || '',
      CITY:   city   || '',
      SOURCE: source || '',
    },
    listIds: [parseInt(process.env.BREVO_LIST_ID, 10)],
    updateEnabled: true,
  };

  let brevoRes;
  try {
    brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key':      process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'accept':       'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[subscribe] network error calling Brevo:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong, please try again.' });
  }

  if (brevoRes.ok || brevoRes.status === 201) {
    return res.status(200).json({ success: true });
  }

  let body;
  try { body = await brevoRes.json(); } catch { body = {}; }

  if (body.code === 'duplicate_parameter') {
    return res.status(200).json({ success: true });
  }

  console.error('[subscribe] Brevo error:', brevoRes.status, body);
  return res.status(500).json({ success: false, message: 'Something went wrong, please try again.' });
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Cors from 'cors';

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== 'POST') return res.status(200).json({ name: 'Hi Franky' });

  const bodyData = req.body;
  const authorization = req.headers.authorization;
  console.log(bodyData);

  try {
    const resp = await fetch('https://api.ms3.net/api/V1/FTTPOrders/Create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      body: JSON.stringify(bodyData),
    });

    const lData = await resp.json();
    res.status(200).json(lData);
  } catch (error) {
    res.status(400).json(error);
  }
}

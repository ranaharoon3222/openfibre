// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Cors from 'cors';
import axios from 'axios';

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

  try {
    const resp = await axios.get(
      'https://api.ms3.net/api/V1/Appointments/GetAvailableAppointments',
      {
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(bodyData),
      }
    );

    res.status(200).json(resp.data);
  } catch (error) {
    res.status(400).json(error);
  }
}

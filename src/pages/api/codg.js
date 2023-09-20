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
  // const sData = JSON.stringify(bodyData);
  const rData = JSON.parse(bodyData);
  let productId;
  let productPrice;

  if (rData.fttpProductCode == 'F_A_L3_100') {
    productId = 392;
    productPrice = 28.99 * 100;
  } else if (rData.fttpProductCode == 'F_A_L3_1000') {
    productId = 394;
    productPrice = 38.99 * 100;
  } else if (rData.fttpProductCode == 'F_A_L3_500') {
    productId = 393;
    productPrice = 32.99 * 100;
  } else if (rData.fttpProductCode == 'F_E_L3_100') {
    productId = 395;
    productPrice = 22 * 100;
  }

  try {
    const resp = await fetch('https://api.ms3.net/api/V1/FTTPOrders/Create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      body: JSON.stringify(rData),
    });

    const contactResp = await fetch(
      'https://openvoipfibre.eu.teamwork.com/crm/api/v2/contacts.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer tkn.v1_NTI1MzNlNjItYzRhOS00NTg0LWI4NGItYThiMmI4NGMyZGI1LTk4ODQxOS40ODE1NzcuRVU=',
        },
        body: JSON.stringify({
          contact: {
            addressLine1: rData.onSiteLocation,
            emailAddresses: [
              {
                address: rData.subscriberContactEmail,
                isMain: true,
              },
            ],
            firstName: rData.primarySiteContactName,
            lastName: rData.primarySiteContactName,
            phoneNumbers: [
              {
                isMain: true,
                number: rData.subscriberContactNumber,
              },
            ],
            title: rData.primarySiteContactName,
            zipcode: rData.uprn,
          },
        }),
      }
    );

    const contactData = await contactResp.json();

    const dealResp = await fetch(
      'https://openvoipfibre.eu.teamwork.com/crm/api/v2/deals.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer tkn.v1_NTI1MzNlNjItYzRhOS00NTg0LWI4NGItYThiMmI4NGMyZGI1LTk4ODQxOS40ODE1NzcuRVU=',
        },
        body: JSON.stringify({
          deal: {
            expectedCloseDate: `${rData.customerRequestedDate}T14:15:22Z`,
            stage: {
              id: 14498,
              type: 'stages',
            },
            products: [
              {
                id: productId,
                meta: {
                  discount: 0,
                  price: productPrice,
                  quantity: 1,
                },
                type: 'products',
              },
            ],
            contacts: [
              {
                id: contactData?.contact?.id || 0,
                meta: {
                  isMain: true,
                },
                type: 'contacts',
              },
            ],
            state: 'open',
            title: rData.primarySiteContactName,
          },
        }),
      }
    );

    const meetingOrder = await resp.json();

    const dealData = await dealResp.json();

    res.status(200).json({ meetingOrder, dealData, contactData });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
}

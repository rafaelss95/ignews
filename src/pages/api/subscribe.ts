import { query } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { fauna } from '../../services/fauna';
import { stripe } from '../../services/stripe';

type User = Readonly<{
  ref: Readonly<{
    id: string;
  }>;
  data: Readonly<{
    stripe_customer_id?: string;
  }>;
}>;

type Data = Readonly<{
  sessionId: string;
}>;

// eslint-disable-next-line import/no-anonymous-default-export
export default async (
  request: NextApiRequest,
  response: NextApiResponse<Data>
) => {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).end('Method not allowed');
    return;
  }

  const {
    user: { email },
  } = await getSession({ req: request });
  const user = await fauna.query<User>(
    query.Get(query.Match(query.Index('user_by_email', query.Casefold(email))))
  );
  let customerId = user.data.stripe_customer_id;

  if (!customerId) {
    const { id } = await stripe.customers.create({ email });
    customerId = id;
    await fauna.query(
      query.Update(query.Ref(query.Collection('users'), user.ref.id), {
        data: {
          stripe_customer_id: id,
        },
      })
    );
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    line_items: [
      {
        price: 'price_1JGnajADK7e8r4QGMWNRf2jQ',
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });
  return response.status(200).json({ sessionId: checkoutSession.id });
};

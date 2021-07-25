import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import avatarImg from '../../public/images/avatar.svg';
import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';
import styles from './home.module.scss';

type Props = Readonly<{
  product: Readonly<{
    amount: string;
    priceId: string;
  }>;
}>;

export default function Home({ product: { amount } }: Props) {
  return (
    <>
      <Head>
        <title>Home | ignews</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access all the publications
            <br />
            <span>for {amount} month</span>
          </p>
          <SubscribeButton />
        </section>
        <Image src={avatarImg} alt="Girl coding" />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1JGnajADK7e8r4QGMWNRf2jQ');
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const amount = currencyFormatter.format(price.unit_amount / 100);
  const product = {
    amount,
    priceId: price.id,
  } as const;
  const oneDay = 60 * 60 * 24;

  return {
    props: {
      product,
    },
    revalidate: oneDay,
  };
};

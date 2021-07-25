import { signIn, useSession } from 'next-auth/client';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

export function SubscribeButton() {
  const [session] = useSession();

  async function handleSubscribe() {
    if (!session) {
      signIn('github');
      return;
    }

    try {
      const {
        data: { sessionId },
      } = await api.post<Readonly<{ sessionId: string }>>('/subscribe');
      const stripe = await getStripeJs();
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  );
}

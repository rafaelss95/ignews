import Image from 'next/image';
import logoImg from '../../../public/images/logo.svg';
import { SignInButton } from '../SignInButton';
import styles from './styles.module.scss';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Image src={logoImg} alt="ignews" />
        <nav>
          <a href="" className={styles.active}>
            Home
          </a>
          <a href=""></a>
        </nav>
        <SignInButton />
      </div>
    </header>
  );
}

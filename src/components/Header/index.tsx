import styles from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  return (
    <Link href={"/"}>
      <img src="../images/Logo.svg" alt="logo" className={styles.logo}/>
    </Link>
  );
}

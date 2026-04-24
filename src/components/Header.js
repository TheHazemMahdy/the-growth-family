import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './Header.module.css';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span style={{ fontSize: '24px' }}>🌱</span>
        GROWTH FAMILY
      </Link>
      <Link href="/profile" className={styles.profileBtn}>
        {session?.user?.image ? (
          <img
            src={session.user.image + `?t=${Date.now()}`} // ✅ ONLY CHANGE
            alt="Profile"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          '👤'
        )}
      </Link>
    </header>
  );
}
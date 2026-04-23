"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <span className={styles.icon}>🏠</span>
        <span>Home</span>
      </Link>
      
      <Link href="/play" className={`${styles.navItem} ${pathname === '/play' ? styles.active : ''}`}>
        <span className={styles.icon}>🎮</span>
        <span>Play</span>
      </Link>
      
      <Link href="/profile" className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`}>
        <span className={styles.icon}>👤</span>
        <span>Profile</span>
      </Link>
    </nav>
  );
}

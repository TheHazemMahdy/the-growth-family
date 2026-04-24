"use client";

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
    </header>
  );
}

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scores')
      .then(res => res.json())
      .then(data => {
        setScores(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.topOptions}>
        <Link href="/play" className={styles.optionTab}>Play</Link>
        <div className={`${styles.optionTab} ${styles.activeTab}`}>Leaderboard</div>
      </div>
      
      <h1 className={styles.title}>🏆 Leaderboard</h1>

      <div className={styles.tabs}>
        <div 
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Time
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'weekly' ? styles.active : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly
        </div>
      </div>

      <div className={styles.list}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : scores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>No scores yet!</div>
        ) : (
          scores.map((player) => (
            <div key={player.rank} className={`${styles.row} ${player.rank <= 3 ? styles.top3 : ''}`}>
              <div className={styles.rank}>#{player.rank}</div>
              <div className={styles.username}>{player.username}</div>
              <div className={styles.score}>{player.score}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

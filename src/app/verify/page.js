"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    if (!token) {
      setStatus('Invalid verification link.');
      return;
    }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      setStatus(data.message);
    })
    .catch(() => {
      setStatus('An error occurred during verification.');
    });
  }, [token]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>{status}</h1>
      <br />
      <Link href="/profile" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#5cb85c', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
        Go to Login
      </Link>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

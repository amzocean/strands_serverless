import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function StallsFAQ() {
  const router = useRouter();

  useEffect(() => {
    window.location.href =
      'https://forms.gle/QGVwqwDokpqNGWQy7';
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to Stalls FAQ...</p>
    </div>
  );
}

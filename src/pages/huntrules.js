import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function StallsFAQ() {
  const router = useRouter();

  useEffect(() => {
    window.location.href =
	  'https://docs.google.com/document/d/1qzDakKPpu0DDQJAruX-IDreehgdS7Dv5331sFP8ICwU/view';
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to Eidi Hunt 2.0 Rules ..</p>
    </div>
  );
}

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function StallsFAQ() {
  const router = useRouter();

  useEffect(() => {
    window.location.href =
      'https://docs.google.com/document/d/1mvHfHqxG7BVg3f_0mpE9Wu2CHgOukS5iOPNH1TIJm5I/view';
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to Stalls FAQ...</p>
    </div>
  );
}

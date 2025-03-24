import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function StallsFAQ() {
  const router = useRouter();

  useEffect(() => {
    window.location.href =
      'https://chat.whatsapp.com/CuEcC2Rc21yAbXGeUZc3Sc';
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to Eid Milan SUpport ...</p>
    </div>
  );
}

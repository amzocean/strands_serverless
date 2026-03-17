import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#1C3A28" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Eid Milan 1447H</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Montserrat:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style jsx global>{`
        :root {
          --gold: #C9A84C;
          --gold-light: #E8CC7A;
          --cream: #F9F3E8;
          --green: #2D5A40;
          --green-dark: #1C3A28;
          --ink: #1A1208;
          --muted: #8A7A5A;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        html { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }

        body {
          margin: 0 !important;
          padding: 0 !important;
          background: var(--cream);
          font-family: 'Montserrat', sans-serif;
          color: var(--ink);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          overscroll-behavior-y: none;
        }

        /* ── BANNER ── */
        .banner-section {
          display: block;
          width: 100%;
          margin: 0;
          padding: 0;
          line-height: 0;
          font-size: 0;
          animation: riseIn 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        .banner-section img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 60vw;
          object-fit: cover;
          object-position: center;
        }

        /* ── EVENT INFO ── */
        .event-info {
          background: linear-gradient(180deg, #fdf8ee 0%, #f5ede0 100%);
          border-bottom: 1px solid rgba(201,168,76,0.25);
          padding: 18px 16px;
          display: flex;
          align-items: stretch;
          justify-content: center;
          gap: 0;
          animation: fadeIn 0.8s 0.2s ease both;
          opacity: 0;
        }
        .event-info-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          padding: 0 4px;
        }
        .event-info-divider {
          width: 1px;
          height: 44px;
          background: rgba(201,168,76,0.4);
          margin: 0 10px;
          flex-shrink: 0;
          align-self: center;
        }
        .event-info-icon {
          font-size: 20px;
          line-height: 1;
        }
        .event-info-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          white-space: nowrap;
        }
        .event-info-main {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(15px, 3.8vw, 22px);
          font-weight: 600;
          color: var(--green-dark);
          text-align: center;
          line-height: 1.25;
          white-space: normal;
          word-break: break-word;
          width: 100%;
        }
        .event-info-link {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .event-info-map-inline {
          font-size: clamp(10px, 2.5vw, 12px);
          font-weight: 600;
          color: var(--green);
          letter-spacing: 0.3px;
          text-decoration: underline;
          text-underline-offset: 2px;
          white-space: nowrap;
        }
        .event-info-link:active .event-info-main { color: var(--green); }
        .event-info-venue {
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(45,90,64,0.4);
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px auto 24px;
          padding: 0 24px;
          animation: fadeIn 0.8s 0.3s ease both;
          opacity: 0;
        }
        .divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
        .divider-star { color: var(--gold); font-size: 11px; letter-spacing: 4px; white-space: nowrap; }

        /* ── CTA ── */
        .cta-section {
          text-align: center;
          padding: 0 16px 32px;
          animation: fadeIn 0.8s 0.4s ease both;
          opacity: 0;
        }
        .cta-eyebrow {
          font-size: 10px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 16px;
          font-weight: 600;
          display: block;
          line-height: 1.6;
        }
        .cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: var(--green-dark);
          color: white;
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          font-style: italic;
          min-height: 62px;
          padding: 14px 24px;
          border-radius: 6px;
          text-decoration: none;
          letter-spacing: 0.5px;
          box-shadow: 0 6px 24px rgba(28,58,40,0.35);
          overflow: hidden;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .cta-btn::after {
          content: '';
          position: absolute; bottom: 0; left: 0;
          width: 100%; height: 4px;
          background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold));
          background-size: 200%;
          animation: goldShimmer 2s linear infinite;
        }
        .cta-btn:active {
          background: #254D38;
          transform: scale(0.97);
          box-shadow: 0 2px 10px rgba(28,58,40,0.3);
        }
        .cta-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center;
          justify-content: center; gap: 10px;
        }

        /* ── STALLS ── */
        .stalls-wrap {
          max-width: 500px;
          margin: 36px auto 0;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 10px;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 20px rgba(28,58,40,0.08);
        }
        .stalls-header {
          background: linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04));
          border-bottom: 1px solid rgba(201,168,76,0.25);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .stalls-header-icon { font-size: 18px; line-height: 1; }
        .stalls-header-text {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--gold);
        }
        .stalls-body {
          padding: 16px 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .stalls-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #c8c8c8;
          color: #888;
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          font-style: italic;
          min-height: 62px;
          padding: 14px 20px;
          border-radius: 6px;
          text-decoration: none;
          letter-spacing: 0.3px;
          box-shadow: none;
          overflow: hidden;
          pointer-events: none;
          cursor: not-allowed;
        }
        .stalls-btn::after { display: none; }
        .stalls-btn-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 8px;
        }
        .stalls-btn-closed {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-style: normal;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #fff;
          background: rgba(0,0,0,0.15);
          padding: 3px 8px;
          border-radius: 4px;
        }
        .stalls-faq {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 6px;
          background: rgba(201,168,76,0.07);
          border: 1px solid rgba(201,168,76,0.2);
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .stalls-faq:active { background: rgba(201,168,76,0.15); }
        .stalls-faq-icon { font-size: 16px; flex-shrink: 0; }
        .stalls-faq-text { flex: 1; text-align: left; }
        .stalls-faq-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--green-dark);
          letter-spacing: 0.3px;
        }
        .stalls-faq-sub {
          display: block;
          font-size: 10px;
          color: var(--muted);
          margin-top: 1px;
        }
        .stalls-faq-arrow { color: var(--gold); font-size: 14px; flex-shrink: 0; }

        /* ── CAPTION SECTION ── */
        .caption-section {
          max-width: 600px;
          margin: 0 auto 48px;
          padding: 0 16px;
          animation: fadeIn 0.8s 0.6s ease both;
          opacity: 0;
        }

        .caption-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .caption-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 10px;
          display: block;
        }
        .caption-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 8vw, 40px);
          font-weight: 600;
          line-height: 1.25;
          color: var(--green-dark);
          margin-bottom: 12px;
        }
        .caption-title em { font-style: italic; color: var(--gold); }
        .caption-desc {
          font-size: 14px;
          line-height: 1.8;
          color: var(--muted);
          font-weight: 400;
        }
        .caption-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-style: italic;
          color: var(--green-dark);
          background: rgba(201,168,76,0.1);
          border-left: 3px solid var(--gold);
          border-radius: 4px;
          padding: 12px 16px;
          margin: 16px 0 0;
          text-align: left;
          line-height: 1.6;
        }

        .caption-img-wrap {
          position: relative;
          display: block;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15);
          border: 1px solid rgba(201,168,76,0.3);
          margin-bottom: 16px;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .caption-img-wrap:active { opacity: 0.88; }
        .caption-img-wrap img {
          display: block;
          width: 100%;
          height: auto;
        }
        .caption-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(28,58,40,0.65) 0%, transparent 55%);
          display: flex;
          align-items: flex-end;
          padding: 18px;
          pointer-events: none;
        }
        .caption-img-overlay-text {
          color: white;
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-style: italic;
          letter-spacing: 0.3px;
          line-height: 1.4;
        }

        /* ── INSTAGRAM BUTTON ── */
        .caption-actions {
          margin-bottom: 14px;
        }
        .ig-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          min-height: 58px;
          padding: 16px 24px;
          border-radius: 6px;
          text-decoration: none;
          box-shadow: 0 4px 18px rgba(131,58,180,0.3);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .ig-btn:active {
          opacity: 0.85;
          transform: scale(0.98);
        }
        .ig-btn svg {
          width: 20px; height: 20px; fill: white; flex-shrink: 0;
        }

        .ig-note {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          line-height: 1.75;
          padding: 14px 16px;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 6px;
        }
        .ig-note strong { color: var(--green-dark); }

        /* ── FOOTER ── */
        footer {
          border-top: 1px solid rgba(201,168,76,0.2);
          padding: 28px 16px;
          padding-bottom: calc(28px + env(safe-area-inset-bottom));
          text-align: center;
          font-size: 12px;
          color: var(--muted);
          letter-spacing: 1.5px;
          font-weight: 300;
          line-height: 2.2;
        }
        footer span { color: var(--gold); margin: 0 6px; }

        /* ── ANIMATIONS ── */
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes goldShimmer {
          0%   { background-position: 0%; }
          100% { background-position: 200%; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      {/* BANNER */}
      <div className="banner-section">
        <img src="/eid-banner.jpeg" alt="Eid Milan 1447H" />
      </div>

      {/* EVENT INFO */}
      <div className="event-info">
        <div className="event-info-block">
          <span className="event-info-icon">🕛</span>
          <span className="event-info-label">Time</span>
          <span className="event-info-main">12:00 – 4:00 PM</span>
        </div>

        <div className="event-info-divider"></div>

        <div className="event-info-block">
          <span className="event-info-icon">📍</span>
          <span className="event-info-label">Venue</span>
          <a
            className="event-info-link"
            href="https://maps.google.com/?q=Lake+Washington+High+School,+Kirkland,+WA"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="event-info-main event-info-venue">Lake Washington High School</span>
          </a>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="divider">
        <div className="divider-line"></div>
        <div className="divider-star">✦ ✦ ✦</div>
        <div className="divider-line"></div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <span className="cta-eyebrow">Secure your spot — it only takes a minute</span>
        <a
          className="cta-btn"
          href="https://docs.google.com/forms/d/e/1FAIpQLSdjXgG5pCiGxWFSOLhGWhe1RiIzhJ1TJF09E4tvyXZMxVFH6w/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="cta-inner">
            Sign Up for Eid Milan Event Here!
          </span>
        </a>

        {/* STALLS */}
        <div className="stalls-wrap">
          <div className="stalls-header">
            <span className="stalls-header-icon">🏪</span>
            <span className="stalls-header-text">Interested in running a stall?</span>
          </div>
          <div className="stalls-body">
            <div className="stalls-btn stalls-btn-disabled">
              <span className="stalls-btn-inner">
                🛍️ Eid Milan Stalls Sign Up — Closed
              </span>
            </div>
            <a
              className="stalls-faq"
              href="https://docs.google.com/document/d/1mvHfHqxG7BVg3f_0mpE9Wu2CHgOukS5iOPNH1TIJm5I/edit?usp=drivesdk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="stalls-faq-icon">📄</span>
              <span className="stalls-faq-text">
                <span className="stalls-faq-label">Eid Milan Stalls FAQ</span>
                <span className="stalls-faq-sub">Questions about running a stall? Read this first.</span>
              </span>
              <span className="stalls-faq-arrow">›</span>
            </a>
            <img src="/stall.jpg" alt="Eid Milan Stall" style={{display:'block', width:'100%', borderRadius:'6px', marginTop:'4px'}} />
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="divider">
        <div className="divider-line"></div>
        <div className="divider-star">✦ ✦ ✦</div>
        <div className="divider-line"></div>
      </div>

      {/* CONTEST */}
      <div className="caption-section">
        <div className="caption-header">
          <span className="caption-eyebrow">🎩 Also — grab extra raffle tickets</span>
          <h2 className="caption-title">Can you solve the riddle?<br /><em>Win 5 raffle tickets.</em></h2>
          <p className="caption-quote">&#34;Me mardo na sar no taaj chu&#34;</p>
          <p className="caption-desc" style={{marginTop: '16px'}}>Figure out what&#39;s being described, count how many you see in the photo below, and comment your answer on Instagram. The first 5 people with the correct count each win 5 raffle tickets!</p>
        </div>

        <a
          className="caption-img-wrap"
          href="https://www.instagram.com/eidmilanseattle?igsh=dHRjcHhtMm14Nzc0"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Instagram to comment your answer"
        >
          <img src="/people.jpeg" alt="Count what the riddle describes in this photo from Eid Milan" />
          <div className="caption-img-overlay">
            <span className="caption-img-overlay-text">Tap to comment your answer on Instagram →</span>
          </div>
        </a>

        <div className="caption-actions">
          <a
            className="ig-btn"
            href="https://www.instagram.com/eidmilanseattle?igsh=dHRjcHhtMm14Nzc0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            💬 Comment Your Answer
          </a>
        </div>

        <p className="ig-note">
          🏆 <strong>First 5 correct answers</strong> on the Instagram post each win <strong>5 raffle tickets</strong>
        </p>
      </div>

      {/* FOOTER */}
      <footer>
        EID MILAN 1447H<span>✦</span>عيد مبارك<br />
        May your celebration be filled with joy &amp; blessings
      </footer>
    </>
  );
}

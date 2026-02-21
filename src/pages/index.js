import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
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

        html { margin: 0; padding: 0; }
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: var(--cream);
          font-family: 'Montserrat', sans-serif;
          color: var(--ink);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ── BANNER ── */
        .banner-section {
          display: block;
          width: 100vw;
          margin: 0;
          padding: 0;
          line-height: 0;
          font-size: 0;
          position: relative;
          left: 0;
          top: 0;
          animation: riseIn 1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .banner-section img {
          display: block;
          width: 100%;
          height: auto;
          margin: 0;
          padding: 0;
          border: none;
          border-radius: 0;
          box-shadow: none;
        }

        /* ── DIVIDER ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          max-width: 340px;
          margin: 36px auto 28px;
          padding: 0 20px;
          animation: fadeIn 1s 0.4s ease both;
          opacity: 0;
        }
        .divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
        .divider-star { color: var(--gold); font-size: 12px; letter-spacing: 5px; }

        /* ── INTRO ── */
        .intro {
          text-align: center;
          max-width: 480px;
          margin: 0 auto 36px;
          padding: 0 20px;
          animation: fadeIn 1s 0.6s ease both;
          opacity: 0;
        }
        .intro-eyebrow {
          font-size: 9px; font-weight: 700; letter-spacing: 4px;
          text-transform: uppercase; color: var(--gold); margin-bottom: 12px;
        }
        .intro h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(26px, 7vw, 42px);
          font-weight: 600; line-height: 1.25;
          color: var(--green-dark); margin-bottom: 14px;
        }
        .intro h1 em { font-style: italic; color: var(--gold); }
        .intro p {
          font-size: 13px; line-height: 1.85; color: var(--muted); font-weight: 300;
        }

        /* ── GAME CARD ── */
        .game-card {
          max-width: 800px;
          margin: 0 auto 36px;
          padding: 0 16px;
          animation: fadeIn 1s 0.8s ease both;
          opacity: 0;
        }
        .game-inner {
          background: white;
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 4px 32px rgba(0,0,0,0.07);
        }

        .game-header {
          background: linear-gradient(135deg, var(--green-dark), #254D38);
          padding: 18px 20px;
        }
        .game-tag {
          font-size: 9px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: var(--gold-light);
          border: 1px solid rgba(201,168,76,0.35);
          padding: 3px 10px; border-radius: 20px;
          display: inline-block; margin-bottom: 8px;
        }
        .game-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(16px, 5vw, 22px);
          font-weight: 600; color: white; line-height: 1.35;
        }

        .game-body { padding: 24px 20px; }

        /* ── CLUES ── */
        .clue-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .clue-block {
          background: #FDFAF3;
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 4px;
          padding: 20px;
          position: relative;
        }
        .clue-block::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--gold), var(--gold-light));
          border-radius: 4px 4px 0 0;
        }
        .clue-label {
          font-size: 9px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .clue-label::after { content: ''; flex: 1; height: 1px; background: rgba(201,168,76,0.25); }

        .emoji-display {
          font-size: 44px;
          letter-spacing: 6px;
          text-align: center;
          margin: 8px 0 16px;
          line-height: 1;
          animation: float 3s ease-in-out infinite;
          display: block;
        }
        .emoji-breakdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .emoji-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12.5px;
          color: var(--muted);
          line-height: 1.5;
        }
        .emoji-row .e { font-size: 22px; line-height: 1.2; flex-shrink: 0; }
        .emoji-row .arrow { color: var(--gold); font-size: 10px; flex-shrink: 0; margin-top: 3px; }

        /* ── HANGMAN DASHES ── */
        .hangman-wrap {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .hangman-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .hangman-dashes {
          display: flex;
          gap: 7px;
          align-items: flex-end;
        }
        .dash {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--gold);
          border-radius: 2px;
          position: relative;
        }
        .dash.revealed {
          background: transparent;
          border-bottom: 2px solid var(--gold);
          height: auto;
          width: 22px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--green-dark);
          text-align: center;
          line-height: 1;
          padding-bottom: 3px;
          border-radius: 0;
        }
        .hangman-space {
          width: 14px;
        }
        .hangman-count {
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
          opacity: 0.6;
          font-weight: 600;
        }

        /* ── SEPARATOR ── */
        .card-sep {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 0;
        }
        .card-sep-line { flex: 1; height: 1px; background: rgba(201,168,76,0.2); }
        .card-sep-text { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--gold); font-weight: 600; white-space: nowrap; }

        /* ── CTA ── */
        .cta-section {
          text-align: center;
          padding: 0 16px 72px;
          animation: fadeIn 1s 1s ease both;
          opacity: 0;
        }
        .cta-eyebrow {
          font-size: 9px; letter-spacing: 3.5px; text-transform: uppercase;
          color: var(--muted); margin-bottom: 20px; font-weight: 600;
        }
        .cta-btn {
          display: block;
          position: relative;
          background: var(--green-dark);
          color: white;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 5.5vw, 28px);
          font-weight: 600;
          font-style: italic;
          padding: 20px 24px;
          border-radius: 4px;
          text-decoration: none;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 24px rgba(28,58,40,0.35);
          overflow: hidden;
          animation: ctaBob 3s ease-in-out infinite;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        .cta-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          transform: translateX(-100%);
          animation: ctaSweep 3s ease-in-out infinite;
        }
        .cta-btn::after {
          content: '';
          position: absolute; bottom: 0; left: 0;
          width: 100%; height: 3px;
          background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold));
          background-size: 200%;
          animation: goldShimmer 2s linear infinite;
        }
        .cta-btn:active {
          transform: scale(0.98);
          box-shadow: 0 3px 12px rgba(28,58,40,0.3);
          animation: none;
        }
        .cta-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center;
          justify-content: center; gap: 12px; flex-wrap: wrap;
        }
        .cta-badge {
          background: var(--gold); color: white;
          font-family: 'Montserrat', sans-serif; font-style: normal;
          font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; padding: 4px 12px; border-radius: 20px;
        }
        .cta-urgency {
          margin-top: 16px;
          font-size: 11px; letter-spacing: 1px;
          color: var(--green-dark); font-weight: 700;
          line-height: 1.6;
          padding: 10px 16px;
          background: rgba(201,168,76,0.12);
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 4px;
          display: inline-block;
          max-width: 480px;
          width: 100%;
        }
        .cta-urgency strong { color: var(--gold); }

        /* ── FOOTER ── */
        footer {
          border-top: 1px solid rgba(201,168,76,0.2);
          padding: 24px 16px; text-align: center;
          font-size: 11px; color: var(--muted); letter-spacing: 1.5px; font-weight: 300;
          line-height: 2;
        }
        footer span { color: var(--gold); margin: 0 6px; }

        /* ── ANIMATIONS ── */
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes ctaBob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes ctaSweep {
          0%        { transform: translateX(-100%); }
          60%, 100% { transform: translateX(200%); }
        }
        @keyframes goldShimmer {
          0%   { background-position: 0%; }
          100% { background-position: 200%; }
        }
      `}</style>

      {/* BANNER */}
      <div className="banner-section">
        <img src="/eid-banner.jpeg" alt="Eid Milan 1447H" />
      </div>

      {/* DIVIDER */}
      <div className="divider">
        <div className="divider-line"></div>
        <div className="divider-star">✦ ✦ ✦</div>
        <div className="divider-line"></div>
      </div>

      {/* INTRO */}
      <div className="intro">
        <p className="intro-eyebrow">A Little Trivia First</p>
        <h1>Test your memory.<br /><em>Win 10 raffle tickets.</em></h1>
        <p>Cast your mind back to last year&#39;s Eid Milan. Crack either clue, RSVP with your answer, and if you&#39;re one of the first two — the tickets are yours.</p>
      </div>

      {/* GAME CARD */}
      <div className="game-card">
        <div className="game-inner">

          <div className="game-header">
            <span className="game-tag">🏆 Eid Milan Trivia</span>
            <h2>What was one of last year&#39;s Eid Milan grand raffle prizes?</h2>
          </div>

          <div className="game-body">
            <div className="clue-section">

              {/* CLUE 1: Ninja Combi */}
              <div className="clue-block">
                <div className="clue-label">Clue 1 — Emoji Code</div>
                <span className="emoji-display">🥷🌀🔥💨</span>
                <div className="emoji-breakdown">
                  <div className="emoji-row">
                    <span className="e">🥷</span>
                    <span className="arrow">→</span>
                    <span>Not a chef, not a samurai — but the brand name would fit either</span>
                  </div>
                  <div className="emoji-row">
                    <span className="e">🌀🔥💨</span>
                    <span className="arrow">→</span>
                    <span>A kitchen multitasker so good, it made your oven jealous</span>
                  </div>
                </div>
                <div className="hangman-wrap">
                  <div className="hangman-group">
                    <div className="hangman-dashes">
                      <span className="dash"></span>
                      <span className="dash revealed">I</span>
                      <span className="dash"></span>
                      <span className="dash"></span>
                      <span className="dash"></span>
                    </div>
                    <div className="hangman-count">5 letters</div>
                  </div>
                  <div className="hangman-space"></div>
                  <div className="hangman-group">
                    <div className="hangman-dashes">
                      <span className="dash"></span>
                      <span className="dash revealed">O</span>
                      <span className="dash"></span>
                      <span className="dash"></span>
                      <span className="dash"></span>
                    </div>
                    <div className="hangman-count">5 letters</div>
                  </div>
                </div>
              </div>

              {/* CLUE 2: Igloo Cooler */}
              <div className="clue-block">
                <div className="clue-label">Clue 2 — Emoji Code</div>
                <span className="emoji-display">🧊🏠❄️🧺</span>
                <div className="emoji-breakdown">
                  <div className="emoji-row">
                    <span className="e">🧊🏠</span>
                    <span className="arrow">→</span>
                    <span>An architect&#39;s nightmare — no wood, no bricks, just subzero engineering</span>
                  </div>
                  <div className="emoji-row">
                    <span className="e">❄️🧺</span>
                    <span className="arrow">→</span>
                    <span>It never cooks, only preserves — your drinks&#39; best friend on a hot day</span>
                  </div>
                </div>
                <div className="hangman-wrap">
                  <div className="hangman-group">
                    <div className="hangman-dashes">
                      <span className="dash"></span>
                      <span className="dash"></span>
                      <span className="dash revealed">L</span>
                      <span className="dash"></span>
                      <span className="dash"></span>
                    </div>
                    <div className="hangman-count">5 letters</div>
                  </div>
                  <div className="hangman-space"></div>
                  <div className="hangman-group">
                    <div className="hangman-dashes">
                      <span className="dash"></span>
                      <span className="dash"></span>
                      <span className="dash"></span>
                      <span className="dash"></span>
                      <span className="dash revealed">E</span>
                      <span className="dash"></span>
                    </div>
                    <div className="hangman-count">6 letters</div>
                  </div>
                </div>
              </div>

            </div>

            <div className="card-sep">
              <div className="card-sep-line"></div>
              <div className="card-sep-text">Name either prize in the RSVP form</div>
              <div className="card-sep-line"></div>
            </div>

          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <p className="cta-eyebrow">Think you remember? Don&#39;t overthink it.</p>
        <a
          className="cta-btn"
          href="https://docs.google.com/forms/d/e/1FAIpQLSdjXgG5pCiGxWFSOLhGWhe1RiIzhJ1TJF09E4tvyXZMxVFH6w/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="cta-inner">
            RSVP &amp; Claim Your Tickets
            <span className="cta-badge">+10 Tickets</span>
          </span>
        </a>
        <div className="cta-urgency">
          ⚡ <strong>First 2 people</strong> to answer correctly &amp; RSVP win the prize!
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        EID MILAN 1447H<span>✦</span>عيد مبارك<br />
        May your celebration be filled with joy &amp; blessings
      </footer>
    </>
  );
}
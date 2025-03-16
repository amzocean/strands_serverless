// src/pages/game.js
import React, { useState, useEffect } from 'react';

export default function Game() {
  const [name, setName] = useState('');
  const [answer, setAnswer] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Detect mobile view (width less than 600px)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Detect dark theme preference
  useEffect(() => {
    const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkMq.matches);
    const handler = (e) => setIsDark(e.matches);
    darkMq.addEventListener('change', handler);
    return () => darkMq.removeEventListener('change', handler);
  }, []);

  // Poll for submissions every 5 seconds
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/getAnswers');
        const data = await res.json();
        if (data.submissions) {
          setSubmissions(data.submissions);
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
      }
    };

    fetchSubmissions();
    const intervalId = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!answer.trim()) {
      setError('Please provide an answer.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/submitAnswer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, answer })
      });
      const data = await res.json();
      if (data.success) {
        setName('');
        setAnswer('');
        setSubmissions(data.submissions || []);
      } else {
        setError(data.error || 'Submission failed. Try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  // Build frequency map of answers (ignoring names)
  const wordFrequencies = submissions.reduce((acc, curr) => {
    const ans = curr.answer.trim().toLowerCase();
    if (ans) {
      acc[ans] = (acc[ans] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div style={{
      ...styles.container,
      ...(isDark ? { background: '#121212', color: '#f0f0f0' } : {})
    }}>
      <div style={{ ...styles.innerContainer, padding: isMobile ? '10px' : '20px' }}>
        {/* Clue Image */}
        <img src="/clue.jpg" alt="Clue" style={styles.clueImage} />

        {/* Clue Text */}
        <div style={{ ...styles.clueText, ...(isDark ? { color: '#fff' } : {}) }}>
          <p>
            ✨ EidiHunt is back—let’s bring on the cheer,<br />
            The venue’s a mystery, but the clues are all here! ✨
          </p>
          <p>
            💭 Think fast, look close—decode the venue name,<br />
            The first to solve it gains an edge in the game! 🔍
          </p>
        </div>

        {/* Puzzle Container (Form & Word Cloud) */}
        <div style={{ ...styles.puzzleContainer, ...(isDark ? { background: '#1e1e1e' } : {}) }}>
          {/* Submission Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                ...styles.input,
                width: isMobile ? '90%' : '80%',
                maxWidth: isMobile ? '90%' : '300px',
                ...(isDark ? { background: '#333', color: '#f0f0f0', border: '1px solid #555' } : {})
              }}
            />
            <input
              type="text"
              placeholder="Your Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={{
                ...styles.input,
                width: isMobile ? '90%' : '80%',
                maxWidth: isMobile ? '90%' : '300px',
                ...(isDark ? { background: '#333', color: '#f0f0f0', border: '1px solid #555' } : {})
              }}
            />
            <button
              type="submit"
              style={{
                ...styles.button,
                width: isMobile ? '100%' : undefined
              }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>

          {/* Live Word Cloud */}
          <div style={styles.wordCloudContainer}>
            <h3>Live Word Cloud</h3>
            <div style={{
              ...styles.wordCloud,
              padding: isMobile ? '5px' : '10px',
              ...(isDark ? { background: '#333', border: '1px solid #555' } : {})
            }}>
              {Object.keys(wordFrequencies).length === 0 ? (
                <p>No submissions yet.</p>
              ) : (
                Object.entries(wordFrequencies).map(([word, count]) => (
                  <span
                    key={word}
                    style={{
                      ...styles.word,
                      fontSize: `${Math.min(20 + count * 5, 50)}px`
                    }}
                  >
                    {word}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    background: '#f0f8ff', // Default light background (AliceBlue)
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '50px',
  },
  innerContainer: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  clueImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
  },
  clueText: {
    marginTop: '20px',
    marginBottom: '30px',
    fontSize: '1.3rem',
    lineHeight: '1.5',
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold',
    color: '#333',
  },
  puzzleContainer: {
    background: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
    padding: '20px',
    marginTop: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '30px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '12px 24px',
    background: '#4B67B0',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
    transition: '0.3s ease-in-out',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '-10px',
  },
  wordCloudContainer: {
    marginTop: '20px',
  },
  wordCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    minHeight: '100px',
    background: '#f9f9f9',
  },
  word: {
    padding: '5px',
  },
};

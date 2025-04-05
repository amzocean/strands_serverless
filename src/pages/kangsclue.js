import { useState } from 'react';

export default function EidihuntCheck() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);

  const validPasswords = {
    "A7DK5LQXM": "Meet Jamila ben Hararwala to get your Eidi to progress further.",
    "B3PZ9TWER": "Meet Jamila ben Hararwala to get your Eidi to progress further.",
    "C6L8XNTRV": "Meet Fatema ben Rangwala to get your Eidi to progress further.",
    "D4WQ7MPNZ": "Meet Fatema ben Rangwala to get your Eidi to progress further.",
    "E9FJ2LKTH": "Meet Fatema ben Rangwala to get your Eidi to progress further.",
    "F2MC5YUZQ": "Meet Husain bhai Mandsaurwala to get your Eidi to progress further.",
    "G7NP1QWEM": "Meet Husain bhai Mandsaurwala to get your Eidi to progress further.",
    "H3RZ6BXUY": "Meet Husein bhai Merchant to get your Eidi to progress further.",
    "I8TY9CKQP": "Meet Husein bhai Merchant to get your Eidi to progress further.",
    "J6WA7DMLE": "Meet Husein bhai Merchant to get your Eidi to progress further.",
    "K5QE3UVRM": "Meet Mohammed bhai Rangwala to get your Eidi to progress further.",
    "L1XP4TBNC": "Meet Mohammed bhai Rangwala to get your Eidi to progress further.",
    "M2ZK6YRHD": "Meet Huzeifa bhai Karachiwala to get your Eidi to progress further.",
    "QR5Z8YVFD": "Meet Huzeifa bhai Karachiwala to get your Eidi to progress further."
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (validPasswords[trimmed]) {
      setResult(validPasswords[trimmed]);
    } else {
      setPassword('');
      setResult('Incorrect password. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <img src="/header.jpg" alt="Eidi Hunt 1446H" style={styles.headerImage} />

      <h2 style={styles.heading}>Welcome to Eidi Hunt 1446H!</h2>
      <p style={styles.instructions}>To get your next step, enter your team's secret password below.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter team password"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Submit</button>
      </form>

      {result && (
        <div style={styles.result}>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    background: '#ADD8E6',
    minHeight: '100vh',
    paddingBottom: '50px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px'
  },
  headerImage: {
    width: '100%',
    maxWidth: '900px',
    display: 'block'
  },
  heading: {
    marginTop: '20px',
    fontSize: '28px',
    color: '#333'
  },
  instructions: {
    fontSize: '18px',
    color: '#333'
  },
  form: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '90%',
    maxWidth: '400px'
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#4B67B0',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  result: {
    marginTop: '20px',
    fontSize: '18px',
    color: '#222',
    maxWidth: '600px',
    padding: '10px'
  }
};

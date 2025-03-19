import Link from 'next/link';

export default function Home() {
  return (
    <div style={styles.container}>
      {/* Header Image */}
      <img 
        src="/header.jpg"  
        alt="Eid Milan 1446H"
        style={styles.headerImage}
      />

      {/* Links Section */}
      <div style={styles.linkWrapper}>
        <a 
          href="https://forms.gle/ygCP2sjcj4T71Yvn9" 
          style={styles.link} 
          className="animated-button"
          target="_blank" 
          rel="noopener noreferrer"
        >
          SIGNUP FOR EID MILAN
        </a>

        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLSchi1k4GpPBmw7uQuxnFXbxBfQWE_QtM8qR_dn3wVhkwDvQ7Q/viewform?usp=header" 
          style={styles.link} 
          className="animated-button"
          target="_blank" 
          rel="noopener noreferrer"
        >
          REGISTER YOUR STALL
        </a>

        <Link href="/stallsfaq" style={styles.link}>
          STALLS FAQ
        </Link>

        <Link href="/game" style={styles.link}>
          PLAY A GAME!
        </Link>
      </div>

      {/* Social Icons */}
      <div style={styles.socialIconsWrapper}>
        <a 
          href="https://chat.whatsapp.com/CuEcC2Rc21yAbXGeUZc3Sc" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src="/whatsapp-icon.png" 
            alt="WhatsApp" 
            style={styles.socialIcon} 
          />
        </a>

        <a 
          href="https://www.instagram.com/eidmilanseattle/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src="/instagram-icon.png" 
            alt="Instagram" 
            style={styles.socialIconInsta} 
          />
        </a>
      </div>

      {/* Keyframe for pulse animation */}
      <style jsx>{`
        .animated-button {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    background: '#ADD8E6', // Light Blue Background
    minHeight: '100vh',
    paddingBottom: '50px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  headerImage: {
    width: '100%',
    maxWidth: '900px',
    display: 'block',
  },
  linkWrapper: {
    display: 'flex',
    flexDirection: 'column',
    // Increase vertical spacing between buttons
    gap: '25px',
    // Add more margin to space the section out vertically
    marginTop: '40px',
    marginBottom: '40px',
    width: '90%',
    maxWidth: '360px'
  },
  link: {
    padding: '18px 20px',
    background: '#4B67B0',
    borderRadius: '10px',
    textDecoration: 'none',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
    transition: '0.3s ease-in-out',
    fontSize: 'clamp(16px, 1.2vw, 20px)',
    display: 'block',
    width: '100%',
  },
  socialIconsWrapper: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'center',
    gap: '15px'
  },
  socialIcon: {
    width: '39px',
    height: '39px',
    marginBottom: '20px',
  },
  socialIconInsta: {
    width: '39px',
    height: '39px',
    marginBottom: '20px',
  }
};

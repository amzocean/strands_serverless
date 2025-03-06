import Link from 'next/link';

export default function Home() {
  return (
    <div style={styles.container}>
      {/* Header Image */}
      <img 
        src="/header.jpg"  // Ensure this image is in public/ directory
        alt="Eid Milan 1446H"
        style={styles.headerImage}
      />

      {/* Links Section */}
      <div style={styles.linkWrapper}>
        <a 
          href="https://forms.gle/ygCP2sjcj4T71Yvn9" 
          style={styles.link} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          SIGNUP FOR EID MILAN
        </a>

        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLSchi1k4GpPBmw7uQuxnFXbxBfQWE_QtM8qR_dn3wVhkwDvQ7Q/viewform?usp=header" 
          style={styles.link} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          REGISTER YOUR STALL
        </a>

        <a 
          href="https://docs.google.com/document/d/1mvHfHqxG7BVg3f_0mpE9Wu2CHgOukS5iOPNH1TIJm5I/edit?tab=t.0" 
          style={styles.link} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          STALLS FAQ
        </a>

        <Link href="/game" style={styles.link}>
          PLAY A GAME!
        </Link>
      </div>

      {/* Social Icons */}
      <div style={styles.socialIconsWrapper}>
        {/* WhatsApp icon on the left */}
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

        {/* Instagram icon on the right (made smaller to match WhatsApp size) */}
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
    width: '100%', // Ensure it scales properly
    maxWidth: '900px', // Prevents it from being too large on desktop
    display: 'block',
  },
  linkWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px',
    width: '90%', // Makes it responsive for all screens
    maxWidth: '320px' // Ensures it doesn't stretch too wide on desktop
  },
  link: {
    padding: '15px',
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
  // Reduced width/height to ensure Instagram icon matches WhatsApp icon size
  socialIcon: {
    width: '39px',
    height: '39px',
    marginBottom: '20px',
  },
  // Reduced width/height to ensure Instagram icon matches WhatsApp icon size
  socialIconInsta: {
    width: '39px',
    height: '39px',
    marginBottom: '20px',
  }  
};

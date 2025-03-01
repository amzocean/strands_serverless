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
        <a href="https://docs.google.com/forms/d/1cOw1rXbv4vyC9VxVoQ8CHwS_6bPHUd0-UQ4L14tfNLE/edit" 
           style={styles.link} target="_blank" rel="noopener noreferrer">
          SIGNUP FOR EID MILAN
        </a>

        <a href="https://docs.google.com/forms/d/e/1FAIpQLSchi1k4GpPBmw7uQuxnFXbxBfQWE_QtM8qR_dn3wVhkwDvQ7Q/viewform?usp=header" 
           style={styles.link} target="_blank" rel="noopener noreferrer">
          STALLS REGISTERATION
        </a>

        <Link href="/game" style={styles.link}>
          PLAY A GAME!
        </Link>
      </div>

      {/* Instagram Button */}
      <div style={styles.instagramWrapper}>
        <a href="https://www.instagram.com/eidmilanseattle/" target="_blank" rel="noopener noreferrer">
          <img src="/instagram-icon.png" alt="Instagram" style={styles.instagramIcon} />
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
    background: '#4B67B0', // Updated to the requested color
    borderRadius: '10px',
    textDecoration: 'none',
    color: '#fff', // White text for contrast
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
    transition: '0.3s ease-in-out',
    fontSize: 'clamp(16px, 1.2vw, 20px)', // Responsive text size
    display: 'block',
    width: '100%', // Makes buttons fit mobile screens properly
  },
  instagramWrapper: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'center',
  },
  instagramIcon: {
    width: '40px',
    height: '40px',
    marginBottom: '20px', // Adds spacing for mobile
  }
};

import React from 'react';

export default function StallsFAQ() {
  return (
    <div style={styles.container}>
      <iframe
        title="Stalls FAQ Document"
        src="https://docs.google.com/document/d/1mvHfHqxG7BVg3f_0mpE9Wu2CHgOukS5iOPNH1TIJm5I/preview"
        style={styles.iframe}
        allowFullScreen
      />
    </div>
  );
}

const styles = {
  container: {
    margin: 0,
    padding: 0,
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
};

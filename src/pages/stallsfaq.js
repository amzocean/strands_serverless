// src/pages/stallsfaq.js
import React from 'react';

export default function StallsFAQ() {
  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '130%' }}>
    <iframe
        title="Stalls FAQ Document"
        src="https://docs.google.com/document/d/1mvHfHqxG7BVg3f_0mpE9Wu2CHgOukS5iOPNH1TIJm5I/preview"
        style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: '1px solid #ccc',
        borderRadius: '8px',
        }}
    />
    </div>

  );
}

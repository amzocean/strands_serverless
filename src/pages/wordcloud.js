// src/pages/wordcloud.js
import React, { useState, useEffect } from 'react';

export default function WordCloudPage() {
  const [submissions, setSubmissions] = useState([]);

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

  // Compute word frequencies from answers (case-insensitive)
  const wordFrequencies = submissions.reduce((acc, curr) => {
    const ans = curr.answer.trim().toLowerCase();
    if (ans) {
      acc[ans] = (acc[ans] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '20px' }}>
      <h1>Live Word Cloud</h1>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          minHeight: '100px'
        }}
      >
        {Object.keys(wordFrequencies).length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          Object.entries(wordFrequencies).map(([word, count]) => (
            <span
              key={word}
              style={{
                padding: '5px',
                fontSize: `${Math.min(20 + count * 5, 50)}px`
              }}
            >
              {word}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import WordCloudCanvas from '../components/WordCloudCanvas';

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

  const wordFrequencies = submissions.reduce((acc, curr) => {
    const ans = curr.answer.trim().toLowerCase();
    if (ans) {
      acc[ans] = (acc[ans] || 0) + 1;
    }
    return acc;
  }, {});

  const words = Object.entries(wordFrequencies)
    .sort((a, b) => b[1] - a[1]) // sort by frequency
    .slice(0, 100) // only top 100
    .map(([text, value]) => ({ text, value }));

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Eid Milan Venue Puzzle Word Cloud</h1>
      {words.length === 0 ? <p>No submissions yet.</p> : <WordCloudCanvas words={words} />}
    </div>
  );
}

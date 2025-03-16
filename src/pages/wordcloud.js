import React, { useState, useEffect } from 'react';
import WordCloudCanvas from '../components/WordCloudCanvas';

export default function WordCloudPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/getAnswers');
        const data = await res.json();
        if (data.submissions) {
          setSubmissions(data.submissions);
        }
      } catch (err) {
        console.error('Error retrieving submissions:', err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions(); // ✅ Only once on initial load
  }, []);

  // Convert answers to frequency map
  const wordFrequencies = submissions.reduce((acc, curr) => {
    const ans = curr.answer.trim().toLowerCase();
    if (ans) {
      acc[ans] = (acc[ans] || 0) + 1;
    }
    return acc;
  }, {});

  const words = Object.entries(wordFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([text, value]) => ({ text, value }));

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '20px' }}>🎨 Eid Milan Venue Puzzle Word Cloud</h1>
      {loading ? (
        <p>Loading...</p>
      ) : loadError ? (
        <p style={{ color: 'red' }}>Error loading word cloud. Please try again later.</p>
      ) : words.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <WordCloudCanvas words={words} />
      )}
    </div>
  );
}

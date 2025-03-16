// src/pages/submissions.js
import React, { useState, useEffect } from 'react';

export default function SubmissionsPage() {
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Submissions</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Answer</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length === 0 ? (
            <tr>
              <td colSpan="2" style={{ textAlign: 'center', padding: '8px' }}>
                No submissions yet.
              </td>
            </tr>
          ) : (
            submissions.map((submission, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{submission.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{submission.answer}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

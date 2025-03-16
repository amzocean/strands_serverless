import React, { useRef, useEffect } from 'react';
import cloud from 'd3-cloud';

export default function WordCloudCanvas({ words }) {
  const canvasRef = useRef();
  const prevWordsRef = useRef(null); // used to prevent unnecessary re-renders

  useEffect(() => {
    const currWordsStr = JSON.stringify(words);
    if (prevWordsRef.current === currWordsStr) return;
    prevWordsRef.current = currWordsStr;

    if (!words || words.length === 0) return;

    const canvasWidth = 900;
    const canvasHeight = 600;

    const layout = cloud()
      .size([canvasWidth, canvasHeight])
      .words(words.map(d => ({ text: d.text, size: 12 + d.value * 3 }))) // reduced size multiplier
      .padding(2)
      .rotate(() => 0) // no rotation for better packing
      .font('sans-serif')
      .fontSize(d => d.size)
      .on('end', draw);

    layout.start();

    function draw(words) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      words.forEach(word => {
        ctx.save();
        ctx.translate(word.x + canvas.width / 2, word.y + canvas.height / 2);
        ctx.font = `${word.size}px ${word.font}`;
        ctx.fillStyle = getColor(word.text);
        ctx.fillText(word.text, 0, 0);
        ctx.restore();
      });
    }

    function getColor(text) {
      const palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
      return palette[text.length % palette.length];
    }
  }, [words]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={600}
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        margin: '0 auto'
      }}
    />
  );
}

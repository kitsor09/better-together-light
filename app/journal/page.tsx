'use client'

import { useState } from 'react';

export default function JournalPage() {
  const [entries, setEntries] = useState<string[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');

  const handleAddEntry = () => {
    if (currentEntry.trim()) {
      setEntries([currentEntry, ...entries]);
      setCurrentEntry('');
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📓 Journal</h1>
      <p>Write your thoughts, voice notes, or reflections here.</p>
      <textarea
        value={currentEntry}
        onChange={e => setCurrentEntry(e.target.value)}
        placeholder="Write something..."
        style={{ width: '100%', minHeight: '100px', marginBottom: '1rem' }}
      />
      <br />
      <button onClick={handleAddEntry}>Add Entry</button>
      <ul>
        {entries.map((entry, idx) => (
          <li key={idx} style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
            {entry}
          </li>
        ))}
      </ul>
    </main>
  );
}

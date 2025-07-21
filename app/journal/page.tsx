use client'

import { useState } from 'react';

interface JournalEntry {
  id: string;
  content: string;
  timestamp: Date;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');

  const handleAddEntry = () => {
    if (currentEntry.trim()) {
      const newEntry: JournalEntry = {
        id: `${Date.now()}-${Math.random()}`,
        content: currentEntry,
        timestamp: new Date()
      };
      setEntries([newEntry, ...entries]);
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
        {entries.map((entry) => (
          <li key={entry.id} style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
            <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '0.5rem' }}>
              {entry.timestamp.toLocaleString()}
            </div>
            {entry.content}
          </li>
        ))}
      </ul>
    </main>
  );
}

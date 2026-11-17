import React from 'react';
import { RotateCcw } from 'lucide-react';
import { PageIntro, LogTable } from '../components/ui.jsx';

export default function ActivityLog({ lab }) {
  const { logs, resetLab } = lab;
  return (
    <section className="page">
      <PageIntro
        eyebrow="SESSION RECORD"
        title="Activity log"
        text="A chronological record of everything that happened in this local lab."
        action={<button className="secondary-btn" onClick={resetLab}><RotateCcw size={16} /> Clear / reset</button>}
      />
      <div className="panel">
        <div className="panel-heading">
          <div><h3>Recorded events</h3><p>{logs.length} event{logs.length === 1 ? '' : 's'} shown, newest first (last 60 kept).</p></div>
          <span className="tag">LOCAL SESSION</span>
        </div>
        <LogTable logs={logs} />
      </div>
    </section>
  );
}

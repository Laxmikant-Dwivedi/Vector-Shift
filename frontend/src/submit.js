import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

async function submitPipeline(nodes, edges) {
  const response = await fetch(`${API_BASE}/pipelines/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Backend unavailable. Is it running on port 8000? (${text.slice(0, 80)}...)`
    );
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return data;
}

function SubmitButton({ nodes, edges }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitPipeline(nodes, edges);
      const message = [
        `Pipeline Analysis`,
        `─────────────────`,
        `• Nodes: ${result.num_nodes}`,
        `• Edges: ${result.num_edges}`,
        `• Is DAG: ${result.is_dag ? 'Yes ✓' : 'No ✗'}`,
      ].join('\n');
      alert(message);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="submit-button"
      onClick={handleSubmit}
      disabled={loading}
    >
      {loading ? 'Submitting...' : 'Submit Pipeline'}
    </button>
  );
}

async function defaultExport(nodes, edges) {
  try {
    const result = await submitPipeline(nodes, edges);
    const message = [
      'Pipeline Analysis',
      '─────────────────',
      `• Nodes: ${result.num_nodes}`,
      `• Edges: ${result.num_edges}`,
      `• Is DAG: ${result.is_dag ? 'Yes ✓' : 'No ✗'}`,
    ].join('\n');
    alert(message);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

export default defaultExport;
export { SubmitButton, submitPipeline };

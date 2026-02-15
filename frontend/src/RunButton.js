import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

async function executePipeline(nodes, edges) {
  const response = await fetch(`${API_BASE}/pipelines/execute`, {
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
      response.ok
        ? 'Invalid response from server'
        : `Backend unavailable. Is it running on port 8000? (${text.slice(0, 80)}...)`
    );
  }
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

function RunButton({ nodes, edges, setNodes }) {
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const { outputs, error } = await executePipeline(nodes, edges);
      if (error) {
        alert(`Error: ${error}`);
        return;
      }
      if (!outputs || Object.keys(outputs).length === 0) {
        alert('No output nodes in the pipeline. Connect Input → LLM → Output.');
        return;
      }
      setNodes((nds) =>
        nds.map((n) =>
          outputs[n.id] !== undefined
            ? { ...n, data: { ...n.data, result: outputs[n.id] } }
            : n
        )
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="run-button"
      onClick={handleRun}
      disabled={loading}
    >
      {loading ? 'Running...' : 'Run Pipeline'}
    </button>
  );
}

export default RunButton;

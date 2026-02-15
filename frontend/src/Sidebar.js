import React from 'react';

const NODE_TYPES = [
  { type: 'input', label: 'Input', color: '#10b981' },
  { type: 'output', label: 'Output', color: '#f59e0b' },
  { type: 'llm', label: 'LLM', color: '#8b5cf6' },
  { type: 'text', label: 'Text', color: '#0ea5e9' },
  { type: 'dataTransform', label: 'Data Transform', color: '#64748b' },
  { type: 'condition', label: 'Condition', color: '#64748b' },
  { type: 'apiRequest', label: 'API Request', color: '#64748b' },
  { type: 'embedding', label: 'Embedding', color: '#8b5cf6' },
  { type: 'summarizer', label: 'Summarizer', color: '#8b5cf6' },
];

function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">VectorShift</h1>
        <p className="sidebar-subtitle">Pipeline Builder</p>
      </div>
      <div className="sidebar-nodes">
        <h2 className="sidebar-section">Add Nodes</h2>
        <p className="sidebar-hint">Drag nodes onto the canvas</p>
        {NODE_TYPES.map(({ type, label, color }) => (
          <div
            key={type}
            className="sidebar-node"
            style={{ borderLeftColor: color }}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
          >
            {label}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;

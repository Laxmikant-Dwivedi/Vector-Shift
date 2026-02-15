import React from 'react';
import BaseNode from './BaseNode';

const DataProcessingNode = ({ data, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Data Processing"
      subtitle="Process data"
      variant="default"
      className="data-processing-node"
      inputs={[{ id: 'input', label: 'Input', position: 'left' }]}
      outputs={[{ id: 'output', label: 'Output', position: 'right' }]}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
          Mode
        </label>
        <select
          className="nodrag nopan w-full bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200"
          value={data?.mode || 'normalize'}
          onChange={(e) => data?.onChange && data.onChange({ mode: e.target.value })}
        >
          <option value="normalize">Normalize</option>
          <option value="aggregate">Aggregate</option>
          <option value="sort">Sort</option>
          <option value="group">Group</option>
        </select>
      </div>
    </BaseNode>
  );
};

export default DataProcessingNode;

import React from 'react';
import BaseNode from './BaseNode';

const InputNode = ({ data, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Input"
      subtitle="Pipeline input"
      variant="input"
      className="input-node"
      outputs={[{ id: 'output', label: 'Output', position: 'right' }]}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
          Input Data
        </label>
        <input
          type="text"
          className="nodrag nopan w-full bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          placeholder="Enter input..."
          value={data?.value || ''}
          onChange={(e) => data?.onChange && data.onChange({ value: e.target.value })}
        />
      </div>
    </BaseNode>
  );
};

export default InputNode;

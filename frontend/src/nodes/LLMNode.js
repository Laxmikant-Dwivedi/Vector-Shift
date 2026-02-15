import React from 'react';
import BaseNode from './BaseNode';

const LLMNode = ({ data, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="LLM"
      variant="llm"
      className="llm-node"
      inputs={[{ id: 'input', label: 'Input', position: 'left' }]}
      outputs={[{ id: 'output', label: 'Output', position: 'right' }]}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>Model</label>
        <select
          className="nodrag nopan w-full bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200"
          value={data?.model || 'gpt-4'}
          onChange={(e) => data?.onChange && data.onChange({ model: e.target.value })}
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5">GPT-3.5</option>
          <option value="claude">Claude</option>
          <option value="llama">Llama</option>
        </select>
        <label style={{ display: 'block', marginTop: '12px', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
          Temperature
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={data?.temperature || 0.7}
          onChange={(e) => data?.onChange && data.onChange({ temperature: parseFloat(e.target.value) })}
          className="nodrag nopan w-full"
        />
        <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
          {data?.temperature ?? 0.7}
        </div>
      </div>
    </BaseNode>
  );
};

export default LLMNode;

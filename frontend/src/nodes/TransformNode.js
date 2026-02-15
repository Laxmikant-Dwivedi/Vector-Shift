import React from 'react';
import BaseNode from './BaseNode';

const TransformNode = ({ data, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Transform"
      subtitle="Transform text"
      variant="default"
      className="transform-node"
      inputs={[{ id: 'input', label: 'Input', position: 'left' }]}
      outputs={[{ id: 'output', label: 'Output', position: 'right' }]}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
          Transform Type
        </label>
        <select
          className="nodrag nopan w-full bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200"
          value={data?.transformType || 'uppercase'}
          onChange={(e) => data?.onChange && data.onChange({ transformType: e.target.value })}
        >
          <option value="uppercase">Uppercase</option>
          <option value="lowercase">Lowercase</option>
          <option value="reverse">Reverse</option>
          <option value="trim">Trim</option>
        </select>
      </div>
    </BaseNode>
  );
};

export default TransformNode;

import React from 'react';
import BaseNode from './BaseNode';

const ConditionNode = ({ data, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Condition"
      subtitle="Branch by condition"
      variant="default"
      className="condition-node"
      inputs={[{ id: 'input', label: 'Input', position: 'left' }]}
      outputs={[
        { id: 'true', label: 'True', position: 'right' },
        { id: 'false', label: 'False', position: 'right' },
      ]}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
          Expression
        </label>
        <input
          type="text"
          className="nodrag nopan w-full bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200"
          placeholder="e.g. length > 5, contains 'hello'"
          value={data?.expression || ''}
          onChange={(e) => data?.onChange && data.onChange({ expression: e.target.value })}
        />
      </div>
    </BaseNode>
  );
};

export default ConditionNode;

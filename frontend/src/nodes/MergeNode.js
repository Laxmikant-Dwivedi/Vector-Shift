import React from 'react';
import BaseNode from './BaseNode';

const MergeNode = ({ data, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Merge"
      subtitle="Merge multiple inputs"
      variant="default"
      className="merge-node"
      inputs={[
        { id: 'input1', label: 'Input 1', position: 'left' },
        { id: 'input2', label: 'Input 2', position: 'left' },
      ]}
      outputs={[{ id: 'output', label: 'Output', position: 'right' }]}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
          Strategy
        </label>
        <select
          className="nodrag nopan w-full bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200"
          value={data?.strategy || 'concat'}
          onChange={(e) => data?.onChange && data.onChange({ strategy: e.target.value })}
        >
          <option value="concat">Concat</option>
          <option value="union">Union</option>
          <option value="intersection">Intersection</option>
          <option value="zip">Zip</option>
        </select>
      </div>
    </BaseNode>
  );
};

export default MergeNode;

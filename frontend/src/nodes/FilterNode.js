import React from 'react';
import BaseNode from './BaseNode';

const FilterNode = ({ data, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Filter"
      subtitle="Filter by condition"
      variant="default"
      className="filter-node"
      inputs={[{ id: 'input', label: 'Input', position: 'left' }]}
      outputs={[{ id: 'output', label: 'Output', position: 'right' }]}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
          Filter Type
        </label>
        <select
          className="nodrag nopan w-full bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200"
          value={data?.filterType || 'contains'}
          onChange={(e) => data?.onChange && data.onChange({ filterType: e.target.value })}
        >
          <option value="contains">Contains</option>
          <option value="equals">Equals</option>
          <option value="startsWith">Starts with</option>
          <option value="endsWith">Ends with</option>
        </select>
        <label style={{ display: 'block', marginTop: '12px', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
          Condition
        </label>
        <input
          type="text"
          className="nodrag nopan w-full bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200"
          placeholder="Filter value"
          value={data?.condition || ''}
          onChange={(e) => data?.onChange && data.onChange({ condition: e.target.value })}
        />
      </div>
    </BaseNode>
  );
};

export default FilterNode;

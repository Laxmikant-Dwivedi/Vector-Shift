import React from 'react';
import BaseNode from './BaseNode';

const OutputNode = ({ data, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Output"
      subtitle="Pipeline output"
      variant="output"
      className="output-node"
      inputs={[{ id: 'input', label: 'Input', position: 'left' }]}
    >
      <div className="text-xs text-slate-300 min-h-[40px] whitespace-pre-wrap">
        {data?.value != null && data.value !== '' ? data.value : (
          <span className="text-slate-500">Result will appear here</span>
        )}
      </div>
    </BaseNode>
  );
};

export default OutputNode;

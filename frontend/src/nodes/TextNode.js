import React from 'react';
import BaseNode from './BaseNode';

const TextNode = ({ data, id }) => {
  const text = data?.text ?? '';
  const variableRegex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
  const variables = [];
  let m;
  while ((m = variableRegex.exec(text)) !== null) {
    variables.push(m[1]);
  }
  const inputHandles = [
    { id: 'input', label: 'input', position: 'left' },
    ...variables.filter((v) => v !== 'input').map((v) => ({ id: `input-${v}`, label: v, position: 'left' })),
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      title="Text"
      subtitle="Text with variables"
      variant="text"
      className="text-node"
      inputs={inputHandles}
      outputs={[{ id: 'output', label: 'Output', position: 'right' }]}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
          Template
        </label>
        <textarea
          className="nodrag nopan w-full min-h-[60px] bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200"
          placeholder="Use {{ variableName }} for inputs"
          value={text}
          onChange={(e) => data?.onChange && data.onChange({ text: e.target.value })}
        />
      </div>
    </BaseNode>
  );
};

export default TextNode;

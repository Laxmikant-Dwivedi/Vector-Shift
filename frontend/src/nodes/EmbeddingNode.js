import React from 'react';
import { createNode } from './createNode';

const EmbeddingNode = createNode({
  type: 'embedding',
  title: 'Embedding',
  subtitle: 'Create embeddings',
  variant: 'llm',
  inputHandles: [{ id: 'input' }],
  outputHandles: [{ id: 'output' }],
  renderContent: () => (
    <div className="text-xs text-slate-400">text-embedding-3-small</div>
  ),
});

export default EmbeddingNode;

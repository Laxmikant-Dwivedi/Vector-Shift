import React from 'react';
import { createNode } from './createNode';

const SummarizerNode = createNode({
  type: 'summarizer',
  title: 'Summarizer',
  subtitle: 'Summarize content',
  variant: 'llm',
  inputHandles: [{ id: 'input' }],
  outputHandles: [{ id: 'output' }],
  renderContent: () => (
    <div className="text-xs text-slate-400">Extract key points</div>
  ),
});

export default SummarizerNode;

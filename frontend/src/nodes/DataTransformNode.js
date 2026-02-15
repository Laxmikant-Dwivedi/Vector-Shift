import React from 'react';
import { createNode } from './createNode';

const DataTransformNode = createNode({
  type: 'dataTransform',
  title: 'Data Transform',
  subtitle: 'Transform pipeline data',
  variant: 'default',
  inputHandles: [{ id: 'input' }],
  outputHandles: [{ id: 'output' }],
  renderContent: () => (
    <div className="text-xs text-slate-400">Map, filter, or transform</div>
  ),
});

export default DataTransformNode;

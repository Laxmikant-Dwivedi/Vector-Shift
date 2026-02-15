import React from 'react';
import { createNode } from './createNode';

const APIRequestNode = createNode({
  type: 'apiRequest',
  title: 'API Request',
  subtitle: 'HTTP request',
  variant: 'default',
  inputHandles: [{ id: 'url' }, { id: 'body' }],
  outputHandles: [{ id: 'output' }],
  renderContent: ({ data }) => (
    <div className="text-xs text-slate-400">
      {data?.method || 'GET'} request
    </div>
  ),
});

export default APIRequestNode;

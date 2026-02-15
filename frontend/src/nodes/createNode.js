import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import BaseNode from './BaseNode';

/**
 * Factory for creating pipeline nodes from a configuration.
 * Reduces boilerplate when adding new node types.
 *
 * @param {Object} config
 * @param {string} config.type - Node type identifier
 * @param {string} config.title - Display title
 * @param {string} [config.subtitle] - Optional subtitle
 * @param {string} [config.variant] - 'input' | 'output' | 'llm' | 'text' | 'default'
 * @param {Array<{id: string, label?: string}>} [config.inputHandles] - Left handles
 * @param {Array<{id: string, label?: string}>} [config.outputHandles] - Right handles
 * @param {function} config.renderContent - (props) => ReactNode for the content area
 * @returns React component
 */
export function createNode(config) {
  const {
    type,
    title,
    subtitle = '',
    variant = 'default',
    inputHandles = [{ id: 'input' }],
    outputHandles = [{ id: 'output' }],
    renderContent,
  } = config;

  const NodeComponent = (props) => {
    const { id, data, selected } = props;
    const { setNodes, setEdges } = useReactFlow();
    const onClose = useCallback(() => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    }, [id, setNodes, setEdges]);

    return (
      <BaseNode
        title={typeof title === 'function' ? title(data) : title}
        subtitle={typeof subtitle === 'function' ? subtitle(data) : subtitle}
        variant={variant}
        inputHandles={typeof inputHandles === 'function' ? inputHandles(data) : inputHandles}
        outputHandles={typeof outputHandles === 'function' ? outputHandles(data) : outputHandles}
        data={data}
        selected={selected}
        onClose={onClose}
      >
        {renderContent ? renderContent(props) : null}
      </BaseNode>
    );
  };

  NodeComponent.displayName = `Node_${type}`;
  return NodeComponent;
}

export default createNode;

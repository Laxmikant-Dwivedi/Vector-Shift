import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';

import InputNode from './nodes/InputNode';
import OutputNode from './nodes/OutputNode';
import LLMNode from './nodes/LLMNode';
import TextNode from './nodes/TextNode';
import TransformNode from './nodes/TransformNode';
import FilterNode from './nodes/FilterNode';
import MergeNode from './nodes/MergeNode';
import ConditionNode from './nodes/ConditionNode';
import DataProcessingNode from './nodes/DataProcessingNode';

const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('ResizeObserver loop')) return;
  originalError(...args);
};

const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  llm: LLMNode,
  text: TextNode,
  transform: TransformNode,
  filter: FilterNode,
  merge: MergeNode,
  condition: ConditionNode,
  dataProcessing: DataProcessingNode,
};

const loadFromStorage = () => {
  let savedNodes = [];
  let savedEdges = [];
  try {
    const nodesStr = localStorage.getItem('vectorshift-nodes');
    if (nodesStr) {
      const parsedNodes = JSON.parse(nodesStr);
      if (Array.isArray(parsedNodes)) {
        savedNodes = parsedNodes
          .filter((node) => node && node.id && node.type && node.data != null)
          .map((node) => {
            const pos =
              node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number'
                ? node.position
                : { x: Math.random() * 300, y: Math.random() * 300 };
            const { value, variableValues, mergedData, inputValues, conditionResult, text, ...configData } =
              node.data || {};
            return {
              ...node,
              position: pos,
              data: {
                ...configData,
                value: '',
                text: node.type === 'text' ? text || '' : undefined,
                variableValues: node.type === 'text' ? {} : undefined,
                inputValues: node.type === 'merge' ? {} : undefined,
                conditionResult: node.type === 'condition' ? false : undefined,
              },
            };
          });
      }
    }
  } catch (e) {
    console.error('Error loading nodes from localStorage:', e);
  }
  try {
    const edgesStr = localStorage.getItem('vectorshift-edges');
    if (edgesStr) {
      const parsed = JSON.parse(edgesStr);
      savedEdges = Array.isArray(parsed) ? parsed.filter((e) => e && e.source != null && e.target != null) : [];
    }
  } catch (e) {
    console.error('Error loading edges from localStorage:', e);
  }
  return { nodes: savedNodes, edges: savedEdges };
};

const { nodes: savedNodes, edges: savedEdges } = loadFromStorage();
const initialNodes = Array.isArray(savedNodes) ? savedNodes : [];
const initialEdges = Array.isArray(savedEdges) ? savedEdges : [];

function processNodeData(node, inputData, targetHandleId = null) {
  if (node.type === 'input') {
    return { value: node.data.value || '' };
  }
  if (node.type === 'text') {
    const template = node.data.text || '';
    let variableValues = { ...(node.data.variableValues || {}) };
    if (targetHandleId && targetHandleId !== 'input' && targetHandleId.startsWith('input-')) {
      const varName = targetHandleId.replace(/^input-/, '');
      if (varName) variableValues[varName] = inputData;
    }
    const variableRegex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
    let processedText = template.replace(variableRegex, (match, varName) => {
      if (
        variableValues.hasOwnProperty(varName) &&
        variableValues[varName] !== null &&
        variableValues[varName] !== undefined
      ) {
        return String(variableValues[varName]);
      }
      return match;
    });
    return { text: template, value: processedText, variableValues };
  }
  if (node.type === 'llm') {
    const model = node.data.model || 'gpt-4';
    const input = String(inputData).trim();
    const inputLower = input.toLowerCase();
    let response = '';
    if (inputLower.includes('google') || inputLower.includes('.com')) {
      response =
        "Google is a multinational technology company founded in 1998. It specializes in internet-related services and products.";
    } else if (inputLower.includes('microsoft')) {
      response =
        "Microsoft is a multinational technology corporation founded in 1975. It develops software, consumer electronics, and personal computers.";
    } else if (inputLower.includes('hello') || inputLower.includes('hi ') || inputLower === 'hi') {
      response = "Hello! How can I assist you today? I'm here to help answer questions and provide information.";
    } else if (inputLower.startsWith('what is ') || inputLower.startsWith("what's ")) {
      const topic = input.replace(/^what (is|'s) /i, '').trim();
      response = topic
        ? `${topic.charAt(0).toUpperCase() + topic.slice(1)} is a subject that involves multiple aspects and applications.`
        : "I'd be happy to help explain that topic. Could you provide more specific details?";
    } else {
      const modelResponses = {
        'gpt-4': `I understand you're asking about "${inputData}". This is an important topic worth exploring. Could you provide more specific details?`,
        'gpt-3.5': `Regarding "${inputData}": This topic involves multiple aspects and applications.`,
        claude: `"${inputData}" is a topic that can be approached from several angles.`,
        llama: `Your query about "${inputData}" touches on several interesting points.`,
      };
      response = modelResponses[model] || modelResponses['gpt-4'];
    }
    return { value: response };
  }
  if (node.type === 'transform') {
    const transformType = node.data.transformType || 'uppercase';
    const input = String(inputData);
    let result = input;
    if (transformType === 'uppercase') result = input.toUpperCase();
    else if (transformType === 'lowercase') result = input.toLowerCase();
    else if (transformType === 'reverse') result = input.split('').reverse().join('');
    else if (transformType === 'trim') result = input.trim();
    return { value: result };
  }
  if (node.type === 'filter') {
    const filterType = node.data.filterType || 'contains';
    const condition = node.data.condition || '';
    const input = String(inputData);
    let passes = false;
    if (filterType === 'contains') passes = input.toLowerCase().includes(condition.toLowerCase());
    else if (filterType === 'equals') passes = input === condition;
    else if (filterType === 'startsWith') passes = input.toLowerCase().startsWith(condition.toLowerCase());
    else if (filterType === 'endsWith') passes = input.toLowerCase().endsWith(condition.toLowerCase());
    return { value: passes ? input : '' };
  }
  if (node.type === 'merge') {
    const strategy = node.data.strategy || 'concat';
    const inputValues = { ...(node.data.inputValues || {}) };
    const handleId = targetHandleId || 'input1';
    const previousValue = inputValues[handleId];
    if (previousValue === inputData && inputData !== '') {
      return { value: node.data.value || '', inputValues };
    }
    if (inputData !== undefined && inputData !== null && inputData !== '') {
      inputValues[handleId] = inputData;
    } else {
      delete inputValues[handleId];
    }
    const orderedValues = [];
    if (inputValues.input1 != null && inputValues.input1 !== '') orderedValues.push(inputValues.input1);
    if (inputValues.input2 != null && inputValues.input2 !== '') orderedValues.push(inputValues.input2);
    Object.keys(inputValues)
      .sort()
      .forEach((key) => {
        if (key !== 'input1' && key !== 'input2' && inputValues[key] != null && inputValues[key] !== '') {
          orderedValues.push(inputValues[key]);
        }
      });
    let mergedValue = '';
    if (orderedValues.length === 0) mergedValue = '';
    else if (strategy === 'concat') mergedValue = orderedValues.join(' ');
    else if (strategy === 'union') mergedValue = orderedValues.join(', ');
    else if (strategy === 'intersection') mergedValue = orderedValues[0] || '';
    else if (strategy === 'zip') mergedValue = orderedValues.join(' | ');
    else mergedValue = orderedValues.join(' ');
    return { value: mergedValue, inputValues };
  }
  if (node.type === 'condition') {
    const expression = node.data.expression || '';
    const input = String(inputData);
    let result = false;
    try {
      if (expression.includes('>')) {
        const [left, right] = expression.split('>').map((s) => s.trim());
        if (left === 'value' || left === 'input') result = parseFloat(input) > parseFloat(right);
        else if (left === 'length') result = input.length > parseFloat(right);
      } else if (expression.includes('<')) {
        const [left, right] = expression.split('<').map((s) => s.trim());
        if (left === 'value' || left === 'input') result = parseFloat(input) < parseFloat(right);
        else if (left === 'length') result = input.length < parseFloat(right);
      } else if (expression.includes('===') || expression.includes('==')) {
        const [left, right] = expression.split(/===|==/).map((s) => s.trim());
        if (left === 'value' || left === 'input') result = input === right.replace(/['"]/g, '');
      } else if (expression.includes('contains')) {
        const searchTerm = expression.replace(/.*contains\s+['"]?([^'"]+)['"]?.*/i, '$1');
        result = input.toLowerCase().includes(searchTerm.toLowerCase());
      }
    } catch {
      result = false;
    }
    return { value: input, conditionResult: result };
  }
  if (node.type === 'dataProcessing') {
    const mode = node.data.mode || 'normalize';
    const input = String(inputData);
    let result = input;
    if (mode === 'normalize') result = input.trim().replace(/\s+/g, ' ');
    else if (mode === 'aggregate') result = `[Aggregated: ${input}]`;
    else if (mode === 'sort') result = input.split('').sort().join('');
    else if (mode === 'group') result = `[Grouped: ${input}]`;
    return { value: result };
  }
  return { value: inputData };
}

function FlowContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const propagateData = useCallback(
    (sourceNodeId) => {
      setNodes((nds) => {
        const updatedNodes = [...nds];
        const sourceNodeIndex = updatedNodes.findIndex((n) => n.id === sourceNodeId);
        if (sourceNodeIndex === -1) return nds;
        const sourceNode = updatedNodes[sourceNodeIndex];
        let outputValue = '';
        if (sourceNode.type === 'input') outputValue = sourceNode.data.value || '';
        else if (sourceNode.type === 'text') outputValue = sourceNode.data.value || sourceNode.data.text || '';
        else if (sourceNode.type === 'merge') outputValue = sourceNode.data.value || '';
        else if (sourceNode.type === 'condition') outputValue = sourceNode.data.value || '';
        else outputValue = sourceNode.data.value || '';

        const outgoingEdges = edges.filter((e) => e.source === sourceNodeId);
        outgoingEdges.forEach((edge) => {
          const targetNodeIndex = updatedNodes.findIndex((n) => n.id === edge.target);
          if (targetNodeIndex === -1) return;
          const targetNode = updatedNodes[targetNodeIndex];
          const targetHandleId = edge.targetHandle || null;
          let dataToSend = outputValue;
          if (sourceNode.type === 'condition') {
            const sourceHandleId = edge.sourceHandle;
            const conditionResult = sourceNode.data.conditionResult;
            if (sourceHandleId === 'true') dataToSend = conditionResult === true ? outputValue : '';
            else if (sourceHandleId === 'false') dataToSend = conditionResult === false ? outputValue : '';
            else dataToSend = '';
          }
          const processedData = processNodeData(targetNode, dataToSend, targetHandleId);
          updatedNodes[targetNodeIndex] = {
            ...targetNode,
            data: { ...targetNode.data, ...processedData },
          };
        });
        return updatedNodes;
      });
    },
    [edges, setNodes]
  );

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const newEdges = addEdge(
          { ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          eds
        );
        const sourceNode = nodes.find((n) => n.id === params.source);
        if (sourceNode) {
          let sourceData = '';
          if (sourceNode.type === 'input') sourceData = sourceNode.data.value || '';
          else if (sourceNode.type === 'text') sourceData = sourceNode.data.value || sourceNode.data.text || '';
          else sourceData = sourceNode.data.value || '';
          if (sourceData) setTimeout(() => propagateData(params.source), 0);
        }
        return newEdges;
      });
    },
    [setEdges, nodes, propagateData]
  );

  useEffect(() => {
    if (nodes.length === 0) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (!node.data.onChange || !node.data.onDelete) {
          const nodeId = node.id;
          const handleNodeDataChange = (newData) => {
            setNodes((currentNodes) => {
              const updatedNodes = currentNodes.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
              );
              const updatedNode = updatedNodes.find((n) => n.id === nodeId);
              if (updatedNode) {
                if (updatedNode.type === 'input' || updatedNode.type === 'text') {
                  setTimeout(() => propagateData(nodeId), 0);
                } else if (updatedNode.type === 'filter') {
                  setTimeout(() => {
                    setEdges((currentEdges) => {
                      currentEdges.filter((e) => e.target === nodeId).forEach((edge) => propagateData(edge.source));
                      return currentEdges;
                    });
                  }, 0);
                }
              }
              return updatedNodes;
            });
          };
          const handleNodeDelete = (idToDelete) => {
            setNodes((nds) => nds.filter((n) => n.id !== idToDelete));
            setEdges((eds) => eds.filter((e) => e.source !== idToDelete && e.target !== idToDelete));
          };
          return {
            ...node,
            data: { ...node.data, onChange: handleNodeDataChange, onDelete: handleNodeDelete },
          };
        }
        return node;
      })
    );
  }, [propagateData]);

  useEffect(() => {
    try {
      if (nodes.length > 0 || edges.length > 0) {
        const nodesToSave = nodes.map(({ data, ...rest }) => {
          const { onChange, onDelete, ...dataWithoutHandlers } = data;
          return { ...rest, data: dataWithoutHandlers };
        });
        localStorage.setItem('vectorshift-nodes', JSON.stringify(nodesToSave));
        localStorage.setItem('vectorshift-edges', JSON.stringify(edges));
      } else {
        localStorage.removeItem('vectorshift-nodes');
        localStorage.removeItem('vectorshift-edges');
      }
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [nodes, edges]);

  const addNode = useCallback(
    (type, label) => {
      const nodeId = `${type}-${Date.now()}`;
      const handleNodeDataChange = (newData) => {
        setNodes((nds) => {
          const updatedNodes = nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
          );
          const updatedNode = updatedNodes.find((n) => n.id === nodeId);
          if (updatedNode) {
            if (updatedNode.type === 'input' || updatedNode.type === 'text') {
              setTimeout(() => propagateData(nodeId), 0);
            } else if (updatedNode.type === 'filter' || updatedNode.type === 'condition') {
              setTimeout(() => {
                setEdges((currentEdges) => {
                  currentEdges.filter((e) => e.target === nodeId).forEach((edge) => propagateData(edge.source));
                  return currentEdges;
                });
              }, 0);
            } else if (updatedNode.type === 'merge') {
              setTimeout(() => {
                const inputValues = updatedNode.data.inputValues || {};
                const orderedValues = [];
                if (inputValues.input1 != null && inputValues.input1 !== '')
                  orderedValues.push(inputValues.input1);
                if (inputValues.input2 != null && inputValues.input2 !== '')
                  orderedValues.push(inputValues.input2);
                const strategy = updatedNode.data.strategy || 'concat';
                let mergedValue = '';
                if (orderedValues.length === 0) mergedValue = '';
                else if (strategy === 'concat') mergedValue = orderedValues.join(' ');
                else if (strategy === 'union') mergedValue = orderedValues.join(', ');
                else if (strategy === 'intersection') mergedValue = orderedValues[0] || '';
                else if (strategy === 'zip') mergedValue = orderedValues.join(' | ');
                else mergedValue = orderedValues.join(' ');
                setNodes((currentNodes) =>
                  currentNodes.map((n) =>
                    n.id === nodeId ? { ...n, data: { ...n.data, value: mergedValue } } : n
                  )
                );
                propagateData(nodeId);
              }, 0);
            }
          }
          return updatedNodes;
        });
      };
      const handleNodeDelete = (idToDelete) => {
        setNodes((nds) => nds.filter((n) => n.id !== idToDelete));
        setEdges((eds) => eds.filter((e) => e.source !== idToDelete && e.target !== idToDelete));
      };
      let initialData = { onChange: handleNodeDataChange, onDelete: handleNodeDelete };
      if (type === 'input') initialData.value = '';
      else if (type === 'text') initialData.text = '';
      else if (type === 'llm') {
        initialData.model = 'gpt-4';
        initialData.temperature = 0.7;
      } else if (type === 'dataProcessing') {
        initialData.mode = 'normalize';
        initialData.batchSize = 100;
      } else if (type === 'transform') initialData.transformType = 'uppercase';
      else if (type === 'filter') {
        initialData.condition = '';
        initialData.filterType = 'contains';
      } else if (type === 'merge') initialData.strategy = 'concat';
      initialData.inputValues = type === 'merge' ? {} : undefined;
      if (type === 'condition') initialData.expression = '';

      const newNode = {
        id: nodeId,
        type,
        position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
        data: initialData,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [propagateData, setNodes, setEdges]
  );

  const handleSubmit = async () => {
    const submitModule = await import('./submit');
    submitModule.default(nodes, edges);
  };

  useEffect(() => {
    const nodeUpdates = new Map();
    const edgesIntoCondition = edges.filter((e) => {
      const target = nodes.find((n) => n.id === e.target);
      return target && target.type === 'condition';
    });
    const edgesFromCondition = edges.filter((e) => {
      const source = nodes.find((n) => n.id === e.source);
      return source && source.type === 'condition';
    });
    const otherEdges = edges.filter((e) => {
      const source = nodes.find((n) => n.id === e.source);
      const target = nodes.find((n) => n.id === e.target);
      return (
        source &&
        target &&
        source.type !== 'condition' &&
        target.type !== 'condition'
      );
    });

    const processEdge = (edge, dataToSend, isFromCondition = false) => {
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!targetNode) return;
      const targetHandleId = edge.targetHandle || null;
      const processedData = processNodeData(targetNode, dataToSend, targetHandleId);
      if (!nodeUpdates.has(edge.target)) {
        const updateData = { ...targetNode.data, ...processedData };
        if (targetNode.type === 'text' && !updateData.text && targetNode.data.text)
          updateData.text = targetNode.data.text;
        if (targetNode.type === 'merge' && processedData.inputValues)
          updateData.inputValues = processedData.inputValues;
        nodeUpdates.set(edge.target, updateData);
      } else {
        const existing = nodeUpdates.get(edge.target);
        const mergedVariableValues = {
          ...(targetNode.data.variableValues || {}),
          ...(existing.variableValues || {}),
          ...(processedData.variableValues || {}),
        };
        let finalValue = processedData.value;
        let finalInputValues = processedData.inputValues || {};
        if (targetNode.type === 'merge') {
          const currentHandleId = edge.targetHandle || 'input1';
          finalInputValues = {
            ...(targetNode.data.inputValues || {}),
            ...(existing.inputValues || {}),
          };
          if (processedData.inputValues?.[currentHandleId] != null) {
            finalInputValues[currentHandleId] = processedData.inputValues[currentHandleId];
          } else if (dataToSend != null && dataToSend !== '') {
            finalInputValues[currentHandleId] = dataToSend;
          }
          const strategy = targetNode.data.strategy || existing.strategy || 'concat';
          const orderedValues = [];
          if (finalInputValues.input1 != null && finalInputValues.input1 !== '')
            orderedValues.push(finalInputValues.input1);
          if (finalInputValues.input2 != null && finalInputValues.input2 !== '')
            orderedValues.push(finalInputValues.input2);
          Object.keys(finalInputValues)
            .sort()
            .forEach((key) => {
              if (
                key !== 'input1' &&
                key !== 'input2' &&
                finalInputValues[key] != null &&
                finalInputValues[key] !== ''
              ) {
                orderedValues.push(finalInputValues[key]);
              }
            });
          if (orderedValues.length === 0) finalValue = '';
          else if (strategy === 'concat') finalValue = orderedValues.join(' ');
          else if (strategy === 'union') finalValue = orderedValues.join(', ');
          else if (strategy === 'intersection') finalValue = orderedValues[0] || '';
          else if (strategy === 'zip') finalValue = orderedValues.join(' | ');
          else finalValue = orderedValues.join(' ');
        }
        const template = existing.text || targetNode.data.text || '';
        if (targetNode.type === 'text' && template) {
          finalValue = template.replace(
            /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g,
            (match, varName) => {
              if (
                mergedVariableValues.hasOwnProperty(varName) &&
                mergedVariableValues[varName] != null &&
                mergedVariableValues[varName] !== undefined
              ) {
                return String(mergedVariableValues[varName]);
              }
              return match;
            }
          );
        }
        nodeUpdates.set(edge.target, {
          ...existing,
          ...processedData,
          text: template || existing.text,
          value: finalValue,
          inputValues: finalInputValues,
          variableValues: mergedVariableValues,
        });
      }
    };

    [...edgesIntoCondition, ...otherEdges].forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) return;
      const sourceData = nodeUpdates.has(edge.source)
        ? nodeUpdates.get(edge.source)
        : sourceNode.data;
      let sourceValue = '';
      if (sourceNode.type === 'input') sourceValue = sourceData.value || '';
      else if (sourceNode.type === 'text') sourceValue = sourceData.value || sourceData.text || '';
      else if (sourceNode.type === 'condition') sourceValue = sourceData.value || '';
      else sourceValue = sourceData.value || '';
      if (sourceValue !== undefined && sourceValue !== null) {
        processEdge(edge, sourceValue);
      }
    });

    edgesFromCondition.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) return;
      const sourceData = nodeUpdates.has(edge.source)
        ? nodeUpdates.get(edge.source)
        : sourceNode.data;
      const sourceValue = sourceData.value || '';
      const conditionResult = sourceData.conditionResult ?? sourceNode.data.conditionResult;
      let dataToSend = '';
      if (edge.sourceHandle === 'true') dataToSend = conditionResult === true ? sourceValue : '';
      else if (edge.sourceHandle === 'false') dataToSend = conditionResult === false ? sourceValue : '';
      if (sourceValue !== undefined && sourceValue !== null) {
        processEdge(edge, dataToSend, true);
      }
    });

    if (nodeUpdates.size > 0) {
      setNodes((nds) =>
        nds.map((node) =>
          nodeUpdates.has(node.id) ? { ...node, data: nodeUpdates.get(node.id) } : node
        )
      );
    }
  }, [edges, nodes, setNodes]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('input') ||
        target.closest('textarea');
      if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputField) {
        const selectedNodes = nodes.filter((n) => n.selected);
        if (selectedNodes.length > 0) {
          const nodeIds = selectedNodes.map((n) => n.id);
          setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
          setEdges((eds) =>
            eds.filter((e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target))
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, setNodes, setEdges]);

  const onNodesDelete = useCallback(
    (deleted) => {
      const nodeIds = deleted.map((n) => n.id);
      setEdges((eds) =>
        eds.filter((e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target))
      );
    },
    [setEdges]
  );

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>VectorShift</h1>
          <p className="sidebar-subtitle">Pipeline Builder</p>
        </div>
        <div className="node-palette">
          <h2 className="palette-title">Nodes</h2>
          <div className="palette-section">
            <h3 className="palette-section-title">Core</h3>
            <button className="palette-button" onClick={() => addNode('input', 'Input')}>
              📥 Input
            </button>
            <button className="palette-button" onClick={() => addNode('output', 'Output')}>
              📤 Output
            </button>
            <button className="palette-button" onClick={() => addNode('text', 'Text')}>
              📝 Text
            </button>
            <button className="palette-button" onClick={() => addNode('llm', 'LLM')}>
              🤖 LLM
            </button>
          </div>
          <div className="palette-section">
            <h3 className="palette-section-title">Processing</h3>
            <button className="palette-button" onClick={() => addNode('transform', 'Transform')}>
              🔄 Transform
            </button>
            <button className="palette-button" onClick={() => addNode('filter', 'Filter')}>
              🔍 Filter
            </button>
            <button className="palette-button" onClick={() => addNode('merge', 'Merge')}>
              🔀 Merge
            </button>
            <button className="palette-button" onClick={() => addNode('condition', 'Condition')}>
              ⚡ Condition
            </button>
            <button className="palette-button" onClick={() => addNode('dataProcessing', 'Data Processing')}>
              ⚙️ Data Processing
            </button>
          </div>
          <div className="sidebar-footer">
            <button className="submit-button" onClick={handleSubmit}>
              Submit Pipeline
            </button>
          </div>
        </div>
      </div>
      <div className="flow-container" style={{ minHeight: 0 }}>
        <div className="react-flow-wrapper">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodesDelete={onNodesDelete}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            deleteKeyCode={['Delete', 'Backspace']}
          >
            <Background color="#1e293b" gap={16} />
            <Controls
              style={{
                button: {
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                },
              }}
            />
            <MiniMap
              nodeColor={(node) => {
                const colors = {
                  input: '#3b82f6',
                  output: '#f59e0b',
                  llm: '#8b5cf6',
                  text: '#10b981',
                  transform: '#06b6d4',
                  filter: '#ec4899',
                  merge: '#f97316',
                  condition: '#eab308',
                  dataProcessing: '#14b8a6',
                };
                return colors[node.type] || '#64748b';
              }}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
              }}
              maskColor="rgba(0, 0, 0, 0.5)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowContent />
    </ReactFlowProvider>
  );
}

export default App;

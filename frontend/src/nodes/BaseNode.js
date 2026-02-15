import React from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * Base node abstraction for the pipeline. Provides shared structure for
 * all node types: wrapper styling, left/right handles, and configurable content.
 *
 * @param {Object} props
 * @param {string} props.title - Node header title
 * @param {string} props.subtitle - Optional subtitle
 * @param {string} props.variant - Visual variant: 'input' | 'output' | 'llm' | 'text' | custom
 * @param {string[]} props.inputHandles - Array of {id, label} for left-side handles
 * @param {string[]} props.outputHandles - Array of {id, label} for right-side handles
 * @param {React.ReactNode} props.children - Main content area
 * @param {Object} props.data - Node data (from React Flow)
 * @param {boolean} props.selected - Whether node is selected
 * @param {function} [props.onClose] - Called when close button is clicked
 */
function BaseNode({
  title,
  subtitle,
  variant = 'default',
  inputHandles = [],
  outputHandles = [],
  inputs,
  outputs,
  children,
  data,
  selected,
  onClose,
  id,
  className,
}) {
  const inHandles = inputHandles.length ? inputHandles : (inputs || []).map((h) => ({ id: h.id, label: h.label }));
  const outHandles = outputHandles.length ? outputHandles : (outputs || []).map((h) => ({ id: h.id, label: h.label }));
  const handleClose = onClose || (id && data?.onDelete ? () => data.onDelete(id) : null);
  const variantFromClass = { 'input-node': 'input', 'output-node': 'output', 'llm-node': 'llm', 'text-node': 'text' }[className] || variant;
  const variantStyles = {
    input: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/50', accent: 'text-emerald-400' },
    output: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/50', accent: 'text-amber-400' },
    llm: { bg: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/50', accent: 'text-violet-400' },
    text: { bg: 'from-sky-500/20 to-sky-600/10', border: 'border-sky-500/50', accent: 'text-sky-400' },
    default: { bg: 'from-slate-600/20 to-slate-700/10', border: 'border-slate-500/50', accent: 'text-slate-300' },
  };

  const style = variantStyles[variantFromClass] || variantStyles.default;

  return (
    <div
      className={`
        min-w-[180px] rounded-lg border bg-gradient-to-br shadow-lg
        transition-all duration-200 overflow-visible relative
        ${style.bg} ${style.border}
        ${selected ? 'ring-2 ring-white/30 shadow-xl' : ''}
      `}
    >
      {/* Input handles (left) */}
      {inHandles.map((h, i) => (
        <Handle
          key={h.id}
          type="target"
          position={Position.Left}
          id={h.id}
          isConnectable={true}
          style={{
            background: '#34d399',
            width: 14,
            height: 14,
            border: '2px solid white',
            top: inHandles.length === 1 ? undefined : `${((i + 1) / (inHandles.length + 1)) * 100}%`,
          }}
        />
      ))}

      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className={`font-semibold text-sm ${style.accent}`}>{title}</div>
          {subtitle && (
            <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
          )}
        </div>
        {handleClose && (
          <button
            type="button"
            onClick={handleClose}
            className="nodrag nopan shrink-0 w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Remove node"
          >
            ×
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        {children}
      </div>

      {/* Output handles (right) */}
      {outHandles.map((h, i) => (
        <Handle
          key={h.id}
          type="source"
          position={Position.Right}
          id={h.id}
          isConnectable={true}
          style={{
            background: '#34d399',
            width: 14,
            height: 14,
            border: '2px solid white',
            top: outHandles.length === 1 ? undefined : `${((i + 1) / (outHandles.length + 1)) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

export default BaseNode;

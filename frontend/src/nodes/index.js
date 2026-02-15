import BaseNode from './BaseNode';
import { createNode } from './createNode';
import InputNode from './InputNode';
import OutputNode from './OutputNode';
import LLMNode from './LLMNode';
import TextNode from './TextNode';
import TransformNode from './TransformNode';
import FilterNode from './FilterNode';
import MergeNode from './MergeNode';
import ConditionNode from './ConditionNode';
import DataProcessingNode from './DataProcessingNode';
import DataTransformNode from './DataTransformNode';
import APIRequestNode from './APIRequestNode';
import EmbeddingNode from './EmbeddingNode';
import SummarizerNode from './SummarizerNode';

export const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  llm: LLMNode,
  text: TextNode,
  transform: TransformNode,
  filter: FilterNode,
  merge: MergeNode,
  condition: ConditionNode,
  dataProcessing: DataProcessingNode,
  dataTransform: DataTransformNode,
  apiRequest: APIRequestNode,
  embedding: EmbeddingNode,
  summarizer: SummarizerNode,
};

export {
  BaseNode,
  createNode,
  InputNode,
  OutputNode,
  LLMNode,
  TextNode,
  TransformNode,
  FilterNode,
  MergeNode,
  ConditionNode,
  DataProcessingNode,
  DataTransformNode,
  APIRequestNode,
  EmbeddingNode,
  SummarizerNode,
};

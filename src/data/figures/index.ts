// Registry of the static figures (docs/architecture/viz/figures.md, section 8). The key is the figure id: kebab-case
// name of <Name>Figure.astro without "Figure", the name of its words file here, and the element ids
// fig-<id>, fig-<id>-desc. tests/unit/viz/figure-conventions.test.ts keeps components, files and keys in step.
import { AGENT_LOOP } from './agent-loop';
import { CONTAINER_IMAGE } from './container-image';
import { ENCODER_DECODER } from './encoder-decoder';
import { GRU_CELL } from './gru-cell';
import { LORA } from './lora';
import { LSTM_CELL } from './lstm-cell';
import { ML_FAMILIES } from './ml-families';
import { ML_WORKFLOW } from './ml-workflow';
import { MLP } from './mlp';
import { MOE } from './moe';
import { MULTIMODAL } from './multimodal';
import { PARALLELISM } from './parallelism';
import { RAG_PIPELINE } from './rag-pipeline';
import { REGULARIZATION_GEOMETRY } from './regularization-geometry';
import { RESIDUAL_BLOCK } from './residual-block';
import { RLHF_STAGES } from './rlhf-stages';
import { RNN_UNROLLED } from './rnn-unrolled';
import { TRANSFORMER_BLOCK } from './transformer-block';
import type { FigureText } from './types';

export const FIGURES = {
  'ml-families': ML_FAMILIES,
  'ml-workflow': ML_WORKFLOW,
  'regularization-geometry': REGULARIZATION_GEOMETRY,
  'rag-pipeline': RAG_PIPELINE,
  'agent-loop': AGENT_LOOP,
  'rlhf-stages': RLHF_STAGES,
  lora: LORA,
  moe: MOE,
  'encoder-decoder': ENCODER_DECODER,
  multimodal: MULTIMODAL,
  parallelism: PARALLELISM,
  'container-image': CONTAINER_IMAGE,
  mlp: MLP,
  'residual-block': RESIDUAL_BLOCK,
  'transformer-block': TRANSFORMER_BLOCK,
  'rnn-unrolled': RNN_UNROLLED,
  'gru-cell': GRU_CELL,
  'lstm-cell': LSTM_CELL,
} as const satisfies Record<string, FigureText<string>>;
export type FigureId = keyof typeof FIGURES;

// Words of ParallelismFigure (llm/llama-family, "Minh họa"; reused as is in llm/llm-deployment): data, tensor
// and pipeline parallelism on the same 4-layer model and 2 GPUs, one panel each. Layer and micro-batch
// numbers are drawn by the component; every word is here. The caption names no section, so it reads right in
// both lessons. vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'dataTitle'
  | 'tensorTitle'
  | 'pipelineTitle'
  | 'layer1'
  | 'layer2'
  | 'layer3'
  | 'layer4'
  | 'gpu1'
  | 'gpu2'
  | 'halfA'
  | 'halfB'
  | 'fullBatch'
  | 'sumGradients'
  | 'sumResults'
  | 'activations'
  | 'gradients'
  | 'microBatches';

export const PARALLELISM = {
  vi: {
    caption:
      'Cùng một mô hình 4 lớp trên 2 GPU; phần tô đậm là thứ bị chia. ZeRO/FSDP (chia thêm trạng thái của song song dữ liệu) và song song context không có trong hình.',
    label: 'Sơ đồ ba kiểu song song: dữ liệu, tensor và pipeline, trên một mô hình 4 lớp và 2 GPU',
    description:
      'Ba ô, mỗi ô một kiểu song song trên cùng một mô hình 4 lớp và 2 GPU. ' +
      'Song song dữ liệu: mỗi GPU giữ đủ 4 lớp và nhận nửa lô của riêng nó, A hoặc B; hai GPU trao đổi để cộng gradient. ' +
      'Song song tensor: hai GPU nhận cùng một lô; mỗi lớp bị cắt dọc làm đôi, GPU 1 giữ các nửa trái, GPU 2 các nửa phải, và hai GPU trao đổi ở mọi lớp để cộng kết quả. ' +
      'Song song pipeline: GPU 1 giữ lớp 1 và 2, GPU 2 giữ lớp 3 và 4; 4 micro-batch nối đuôi nhau vào GPU 1, micro-batch 1 trước; kích hoạt đi sang GPU 2, gradient đi ngược lại.',
    labels: {
      dataTitle: 'Song song dữ liệu: chia lô',
      tensorTitle: 'Song song tensor: chia ma trận trong lớp',
      pipelineTitle: 'Song song pipeline: chia các lớp',
      layer1: 'Lớp 1',
      layer2: 'Lớp 2',
      layer3: 'Lớp 3',
      layer4: 'Lớp 4',
      gpu1: 'GPU 1',
      gpu2: 'GPU 2',
      halfA: 'Nửa lô A',
      halfB: 'Nửa lô B',
      fullBatch: 'Cả lô',
      sumGradients: 'cộng gradient',
      sumResults: 'cộng kết quả',
      activations: 'kích hoạt',
      gradients: 'gradient',
      microBatches: 'micro-batch',
    },
  },
  en: {
    caption:
      'The same 4-layer model on 2 GPUs; the highlighted part is what gets split. ZeRO/FSDP (which also splits the state of data parallelism) and context parallelism are not in the figure.',
    label: 'Diagram of three kinds of parallelism: data, tensor and pipeline, on a 4-layer model and 2 GPUs',
    description:
      'Three panels, one kind of parallelism each, on the same 4-layer model and 2 GPUs. ' +
      'Data parallelism: each GPU holds all 4 layers and gets its own half of the batch, A or B; the GPUs exchange to sum gradients. ' +
      'Tensor parallelism: both GPUs get the same batch; every layer is cut lengthwise, GPU 1 holds the left halves and GPU 2 the right halves, and they exchange at every layer to sum results. ' +
      'Pipeline parallelism: GPU 1 holds layers 1 and 2, GPU 2 layers 3 and 4; 4 micro-batches queue into GPU 1, micro-batch 1 first; activations go to GPU 2 and gradients come back.',
    labels: {
      dataTitle: 'Data parallelism: split the batch',
      tensorTitle: 'Tensor parallelism: split within a layer',
      pipelineTitle: 'Pipeline parallelism: split the layers',
      layer1: 'Layer 1',
      layer2: 'Layer 2',
      layer3: 'Layer 3',
      layer4: 'Layer 4',
      gpu1: 'GPU 1',
      gpu2: 'GPU 2',
      halfA: 'Half A',
      halfB: 'Half B',
      fullBatch: ['Full', 'batch'],
      sumGradients: 'sum gradients',
      sumResults: 'sum results',
      activations: 'activations',
      gradients: 'gradients',
      microBatches: 'micro-batches',
    },
  },
} satisfies FigureText<Key>;

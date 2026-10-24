// Words of MoeFigure (llm/deepseek-family, "Minh họa"): one token through a DeepSeek-style MoE layer. The
// shared expert always runs, without the router; the router picks 2 of 8 routed experts; the picked outputs
// (weighted by their gates), the shared one and the shortcut add up to the output. The experts are numbered
// 0–7 in the component, as in the code. The gates are token 0's of the lesson's first code cell
// (src/code/llm/deepseek-family/moe-routing.vi.py, run 24/10/2026: experts 2 and 6, gates 0.454 and 0.546).
// `shared` is [main, main, small]; `v3` is [main, small]. `pickedKey` and `idleKey` are the legend boxes.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'token'
  | 'router'
  | 'shared'
  | 'routed'
  | 'pickedKey'
  | 'idleKey'
  | 'gateLow'
  | 'gateHigh'
  | 'add'
  | 'shortcut'
  | 'output'
  | 'v3';

/** Indices (0-based, as in the code) of the routed experts token 0 picks, and their gates, in that order. */
export const MOE_PICKED = [2, 6] as const;
export const MOE_ROUTED = 8;

export const MOE = {
  vi: {
    caption:
      'Lớp MoE tính $\\mathbf{h} = \\mathbf{u} + \\sum_{i} \\mathrm{FFN}^{(s)}_i(\\mathbf{u}) + \\sum_{i} g_i\\,\\mathrm{FFN}^{(r)}_i(\\mathbf{u})$, với $g_i = 0$ ở mọi expert không được chọn; hình vẽ 8 expert định tuyến, chọn 2, như ô code thứ nhất.',
    label: 'Sơ đồ một lớp MoE: router chọn 2 trong 8 expert định tuyến, expert dùng chung luôn chạy',
    description:
      'Token u đi vào router; router chấm điểm 8 expert định tuyến, đánh số 0 tới 7 như trong code, và chỉ chọn 2: expert 2 với trọng số cổng 0.454 và expert 6 với 0.546. Sáu expert còn lại không chạy. ' +
      'Expert dùng chung nhận token trực tiếp, không qua router, và luôn chạy. ' +
      'Đầu ra của các expert được cộng có trọng số, cùng kết nối tắt từ token, thành đầu ra h. ' +
      'Ghi chú cuối hình: DeepSeek-V3 có 1 expert dùng chung và chọn 8 trong 256 expert định tuyến.',
    labels: {
      token: 'Token',
      router: 'Router chấm điểm',
      shared: ['Expert', 'dùng chung', 'luôn chạy'],
      routed: 'Expert định tuyến:',
      pickedKey: 'Được chọn',
      idleKey: 'Không chạy',
      gateLow: '0.454',
      gateHigh: '0.546',
      add: 'Cộng có trọng số',
      shortcut: 'Kết nối tắt',
      output: 'Đầu ra',
      v3: ['DeepSeek-V3', '1 dùng chung + 8 trong 256 định tuyến'],
    },
  },
  en: {
    caption:
      'The MoE layer computes $\\mathbf{h} = \\mathbf{u} + \\sum_{i} \\mathrm{FFN}^{(s)}_i(\\mathbf{u}) + \\sum_{i} g_i\\,\\mathrm{FFN}^{(r)}_i(\\mathbf{u})$, with $g_i = 0$ for every expert not picked; the figure draws 8 routed experts and picks 2, as in the first code cell.',
    label: 'Diagram of an MoE layer: the router picks 2 of 8 routed experts, the shared expert always runs',
    description:
      'The token u goes into the router; the router scores 8 routed experts, numbered 0 to 7 as in the code, and picks only 2: expert 2 with gate weight 0.454 and expert 6 with 0.546. The other six experts do not run. ' +
      'The shared expert takes the token directly, not through the router, and always runs. ' +
      'The outputs of the experts are added with their weights, together with the shortcut from the token, giving the output h. ' +
      'Note at the bottom: DeepSeek-V3 has 1 shared expert and picks 8 of 256 routed experts.',
    labels: {
      token: 'Token',
      router: 'Router scores',
      shared: ['Shared', 'expert', 'always runs'],
      routed: 'Routed experts:',
      pickedKey: 'Picked',
      idleKey: 'Not run',
      gateLow: '0.454',
      gateHigh: '0.546',
      add: 'Weighted sum',
      shortcut: 'Shortcut',
      output: 'Output',
      v3: ['DeepSeek-V3', '1 shared + 8 of 256 routed'],
    },
  },
} satisfies FigureText<Key>;

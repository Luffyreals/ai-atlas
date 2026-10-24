// Words of RlhfStagesFigure (llm/rlhf, "Minh họa"; reused as is in llm/dpo): the three steps of RLHF, SFT,
// learning the reward model (RM) from ranked answers, and optimising the policy with RL under a KL penalty,
// where step 3 uses a frozen RM and the SFT model as reference. Box labels are [main, small...], except `demo`
// and `ref`, whose lines are all main (`ref` takes `frozen` as its small line, like `rmScore`). The prompt
// counts are InstructGPT's (Ouyang et al., 2022), as in the lesson's table.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'step1'
  | 'step1Note'
  | 'step2'
  | 'step2Note'
  | 'step3'
  | 'step3Note'
  | 'demo'
  | 'finetune'
  | 'sft'
  | 'answers'
  | 'rank'
  | 'rm'
  | 'policy'
  | 'answer'
  | 'rmScore'
  | 'ref'
  | 'frozen'
  | 'kl'
  | 'ppo';

export const RLHF_STAGES = {
  vi: {
    caption:
      'Bước 3 tối đa $\\mathbb{E}[r_{\\boldsymbol{\\theta}}] - \\beta\\, D_{\\mathrm{KL}}(\\pi_{\\boldsymbol{\\phi}} \\,\\|\\, \\pi_{\\text{ref}})$; RM và mô hình tham chiếu không đổi trong bước này. Số prompt theo Ouyang và cộng sự (2022).',
    label: 'Sơ đồ ba bước của RLHF: SFT, học mô hình phần thưởng, tối ưu chính sách',
    description:
      'Bước 1, SFT, khoảng 13 nghìn prompt: prompt kèm lời trình diễn do người viết được dùng để fine-tune, cho ra mô hình SFT. ' +
      'Bước 2, học RM, khoảng 33 nghìn prompt: mô hình sinh 4 tới 9 đáp án cho mỗi prompt, người xếp hạng chúng, ví dụ D hơn C hơn A bằng B, và RM học từ thứ hạng đó. ' +
      'Bước 3, tối ưu chính sách, khoảng 31 nghìn prompt: chính sách khởi tạo từ SFT sinh câu trả lời, RM chấm điểm, và PPO cập nhật chính sách. ' +
      'RM ở bước 3 là RM của bước 2 được đóng băng; mô hình tham chiếu là bản đóng băng của mô hình SFT, dùng cho phạt KL.',
    labels: {
      step1: 'Bước 1: SFT',
      step1Note: 'khoảng 13 nghìn prompt',
      step2: 'Bước 2: học RM',
      step2Note: 'khoảng 33 nghìn prompt',
      step3: 'Bước 3: tối ưu chính sách',
      step3Note: 'khoảng 31 nghìn prompt',
      demo: ['Prompt +', 'lời trình diễn'],
      finetune: ['fine-tune', 'cross-entropy'],
      sft: 'Mô hình SFT',
      answers: ['Đáp án A, B, C, D', '4–9 bản mỗi prompt'],
      rank: ['Người xếp hạng', 'D > C > A = B'],
      rm: ['RM', 'mô hình phần thưởng'],
      policy: ['Chính sách', 'khởi tạo từ SFT'],
      answer: 'Câu trả lời',
      rmScore: 'RM chấm điểm',
      ref: ['Mô hình', 'tham chiếu'],
      frozen: 'đóng băng',
      kl: 'phạt KL',
      ppo: 'PPO',
    },
  },
  en: {
    caption:
      'Step 3 maximises $\\mathbb{E}[r_{\\boldsymbol{\\theta}}] - \\beta\\, D_{\\mathrm{KL}}(\\pi_{\\boldsymbol{\\phi}} \\,\\|\\, \\pi_{\\text{ref}})$; the RM and the reference model do not change during this step. Prompt counts from Ouyang et al. (2022).',
    label: 'Diagram of the three steps of RLHF: SFT, learning a reward model, optimising the policy',
    description:
      'Step 1, SFT, about 13 thousand prompts: prompts with demonstrations written by people are used to fine-tune, giving the SFT model. ' +
      'Step 2, learning the RM, about 33 thousand prompts: the model generates 4 to 9 answers per prompt, people rank them, for example D over C over A equal to B, and the RM learns from that ranking. ' +
      'Step 3, policy optimisation, about 31 thousand prompts: the policy, initialised from SFT, generates an answer, the RM scores it, and PPO updates the policy. ' +
      'The RM in step 3 is the RM of step 2, frozen; the reference model is a frozen copy of the SFT model, used for the KL penalty.',
    labels: {
      step1: 'Step 1: SFT',
      step1Note: 'about 13 thousand prompts',
      step2: 'Step 2: learn the RM',
      step2Note: 'about 33 thousand prompts',
      step3: 'Step 3: optimise the policy',
      step3Note: 'about 31 thousand prompts',
      demo: ['Prompt +', 'demonstration'],
      finetune: ['fine-tune', 'cross-entropy'],
      sft: 'SFT model',
      answers: ['Answers A, B, C, D', '4–9 per prompt'],
      rank: ['People rank them', 'D > C > A = B'],
      rm: ['RM', 'reward model'],
      policy: ['Policy', 'initialised from SFT'],
      answer: 'Answer',
      rmScore: 'RM scores it',
      ref: ['Reference', 'model'],
      frozen: 'frozen',
      kl: 'KL penalty',
      ppo: 'PPO',
    },
  },
} satisfies FigureText<Key>;

// Words of AgentLoopFigure (llm/agents, "Minh họa"): the model picks a tool, the program runs it, the result
// goes back to the model, until there is an answer or the step limit is hit. Box labels are [main, small...],
// except `decide` and `run`, whose two lines are one phrase and both main. `yes`, `no`, `again` and `limit`
// are free text beside arrows. The limit matches MAX_STEPS in src/code/llm/agents/agent-loop.vi.py: the check
// comes after the tools ran, as in its `for step in range(MAX_STEPS)` loop.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'question' | 'model' | 'decide' | 'run' | 'result' | 'answer' | 'stop' | 'confirm' | 'yes' | 'no' | 'again' | 'limit';

export const AGENT_LOOP = {
  vi: {
    caption:
      'Mỗi vòng là một lần gọi API; lịch sử $h_t$ dài thêm một lời gọi và một kết quả, tới khi có câu trả lời hoặc $t$ chạm trần $N$ (`MAX_STEPS = 5` trong code).',
    label: 'Sơ đồ vòng lặp của agent: mô hình gọi công cụ, kết quả quay lại mô hình',
    description:
      'Câu hỏi đi vào mô hình. Mô hình đọc cả lịch sử rồi quyết định có gọi công cụ hay không. ' +
      'Nếu không, vòng lặp kết thúc với câu trả lời. Nếu có, chương trình chạy công cụ, và hỏi người dùng trước khi chạy công cụ nguy hiểm; kết quả, dưới dạng message tool, được nối vào lịch sử. ' +
      'Còn lượt thì kết quả quay lại mô hình cho vòng sau; chạm trần số bước thì dừng và báo người dùng.',
    labels: {
      question: 'Câu hỏi',
      model: ['Mô hình', 'đọc cả lịch sử'],
      decide: ['Có gọi', 'công cụ?'],
      run: ['Chương trình', 'chạy công cụ'],
      result: ['Kết quả', 'message tool'],
      answer: 'Câu trả lời',
      stop: ['Dừng', 'báo người dùng'],
      confirm: ['Hỏi người dùng', 'trước công cụ', 'nguy hiểm'],
      yes: 'có',
      no: 'không',
      again: 'còn lượt',
      limit: ['chạm trần', 'số bước'],
    },
  },
  en: {
    caption:
      'Each turn is one API call; the history $h_t$ grows by one call and one result, until there is an answer or $t$ reaches the limit $N$ (`MAX_STEPS = 5` in the code).',
    label: 'Diagram of the agent loop: the model calls tools, the results go back to the model',
    description:
      'The question goes into the model. The model reads the whole history and decides whether to call a tool. ' +
      'If not, the loop ends with an answer. If so, the program runs the tool, asking the user first before a dangerous one; the result, as a tool message, is appended to the history. ' +
      'With steps left, the result goes back to the model for the next turn; at the step limit, the loop stops and tells the user.',
    labels: {
      question: 'Question',
      model: ['Model', 'reads the history'],
      decide: ['Call a', 'tool?'],
      run: ['Program', 'runs the tool'],
      result: ['Result', 'tool message'],
      answer: 'Answer',
      stop: ['Stop', 'tell the user'],
      confirm: ['Ask the user', 'before a', 'dangerous tool'],
      yes: 'yes',
      no: 'no',
      again: 'steps left',
      limit: ['step limit', 'reached'],
    },
  },
} satisfies FigureText<Key>;

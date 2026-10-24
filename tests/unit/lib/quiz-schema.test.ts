import { describe, expect, it } from 'vitest';
import { quizQuestionSchema, quizSchema } from '../../../src/lib/quiz-schema';

const valid = {
  question: 'Nếu $\\eta$ quá lớn, gradient descent có thể làm gì?',
  options: ['Hội tụ nhanh hơn và luôn tới cực tiểu', 'Dao động hoặc phân kỳ'],
  answer: 1,
  explanation: 'Bước nhảy quá dài làm $\\mathcal{L}$ tăng thay vì giảm.',
};

describe('quizQuestionSchema', () => {
  it('accepts a valid question', () => {
    expect(quizQuestionSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an answer index past the last option', () => {
    const result = quizQuestionSchema.safeParse({ ...valid, answer: 2 });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message === 'answer is out of range')).toBe(true);
  });

  it('rejects a negative or fractional answer', () => {
    expect(quizQuestionSchema.safeParse({ ...valid, answer: -1 }).success).toBe(false);
    expect(quizQuestionSchema.safeParse({ ...valid, answer: 0.5 }).success).toBe(false);
  });

  it('rejects a question with only one option', () => {
    expect(quizQuestionSchema.safeParse({ ...valid, options: ['Chỉ một'], answer: 0 }).success).toBe(false);
  });

  it('rejects more than six options', () => {
    const options = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    expect(quizQuestionSchema.safeParse({ ...valid, options }).success).toBe(false);
  });

  it('rejects a missing or empty explanation', () => {
    const { explanation: _omitted, ...withoutExplanation } = valid;
    expect(quizQuestionSchema.safeParse(withoutExplanation).success).toBe(false);
    expect(quizQuestionSchema.safeParse({ ...valid, explanation: '' }).success).toBe(false);
  });

  it('rejects an empty question or an empty option', () => {
    expect(quizQuestionSchema.safeParse({ ...valid, question: '' }).success).toBe(false);
    expect(quizQuestionSchema.safeParse({ ...valid, options: ['Một', ''] }).success).toBe(false);
  });
});

describe('quizSchema', () => {
  it('accepts a quiz of valid questions', () => {
    expect(quizSchema.safeParse([valid, { ...valid, answer: 0 }]).success).toBe(true);
  });

  it('rejects an empty quiz and a quiz of more than ten questions', () => {
    expect(quizSchema.safeParse([]).success).toBe(false);
    expect(quizSchema.safeParse(Array.from({ length: 11 }, () => valid)).success).toBe(false);
  });

  it('rejects the whole quiz when one question is invalid', () => {
    expect(quizSchema.safeParse([valid, { ...valid, answer: 5 }]).success).toBe(false);
  });
});

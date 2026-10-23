// Schema of the frontmatter `quiz` field (docs/architecture/components.md, section 4.4).
// Strings may carry $math$ and `code`; Quiz.astro renders them at build time.
import { z } from 'astro/zod';

export const quizQuestionSchema = z
  .object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(6),
    answer: z.number().int().min(0), // 0-based index into options
    explanation: z.string().min(1), // required: the lesson template asks to explain answers
  })
  .refine((q) => q.answer < q.options.length, { message: 'answer is out of range', path: ['answer'] });

export const quizSchema = z.array(quizQuestionSchema).min(1).max(10);

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

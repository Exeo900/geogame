import { rivers, type River } from './rivers'

export type QuestionType = 'image' | 'clues'

export type RiverQuiz = River

export const riverQuizPool: RiverQuiz[] = rivers

export function getByDifficulty(): RiverQuiz[] {
  return riverQuizPool
}

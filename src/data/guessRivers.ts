import { rivers, type River } from './rivers'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'image' | 'clues'

export interface RiverQuiz extends River {
  difficulty: Difficulty
}

const easyIds = ['nilen', 'amazon', 'yangtze', 'mississippi', 'donau', 'rhen', 'ganges', 'kongo', 'niger', 'volga']
const mediumIds = ['indus', 'mekong', 'orinoco', 'zambezi', 'gulafloden', 'colorado', 'murray']
const hardIds = ['ob', 'jenisej', 'lena', 'amur']

const difficultyMap = new Map<string, Difficulty>([
  ...easyIds.map((id): [string, Difficulty] => [id, 'easy']),
  ...mediumIds.map((id): [string, Difficulty] => [id, 'medium']),
  ...hardIds.map((id): [string, Difficulty] => [id, 'hard']),
])

export const riverQuizPool: RiverQuiz[] = rivers.map((r) => ({
  ...r,
  difficulty: difficultyMap.get(r.id) ?? 'hard',
}))

export function getByDifficulty(difficulty: Difficulty): RiverQuiz[] {
  const levels: Difficulty[] = difficulty === 'easy' ? ['easy'] : difficulty === 'medium' ? ['easy', 'medium'] : ['easy', 'medium', 'hard']
  return riverQuizPool.filter((r) => levels.includes(r.difficulty))
}

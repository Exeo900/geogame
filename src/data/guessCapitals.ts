import type { Country } from './countries'
import { countries } from './countries'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface CapitalQuestion extends Country {
  difficulty: Difficulty
}

const easyCodes: string[] = [
  // Europa
  'se', 'no', 'dk', 'fi', 'gb', 'fr', 'de', 'it', 'es', 'pt',
  'nl', 'be', 'ch', 'at', 'pl', 'gr', 'ru', 'ua',
  // Nordamerika & Karibien
  'us', 'ca', 'mx', 'cu',
  // Sydamerika
  'br', 'ar', 'cl', 'co',
  // Asien & Mellanöstern
  'cn', 'jp', 'in', 'kr', 'tr', 'sa', 'il', 'ir',
  // Afrika
  'za', 'eg', 'ma', 'ng',
  // Oceanien
  'au', 'nz',
]

const mediumCodes: string[] = [
  // Europa
  'ie', 'is', 'cz', 'sk', 'hu', 'ro', 'bg', 'hr', 'rs', 'ee', 'lv', 'lt',
  'by', 'md', 'cy', 'mt', 'al', 'si', 'mk',
  // Amerika
  'gt', 'cr', 'pa', 'pe', 've', 'bo', 'ec', 'uy', 'py',
  'jm', 'ht', 'do', 'tt',
  // Afrika
  'dz', 'tn', 'et', 'ke', 'tz', 'gh', 'sn', 'ao', 'zw', 'mz',
  'cm', 'cd', 'na', 'bw', 'ug',
  // Asien & Mellanöstern
  'pk', 'bd', 'th', 'vn', 'id', 'my', 'ph', 'sg', 'af', 'kz',
  'iq', 'ae', 'qa', 'jo', 'lb', 'sy', 'kw',
  // Oceanien
  'pg', 'fj',
]

const hardCodes: string[] = [
  // Europa
  'lu', 'li', 'ad', 'mc', 'sm', 'ba', 'me', 'xk',
  // Amerika
  'bz', 'hn', 'sv', 'ni', 'bb', 'gy', 'sr',
  // Afrika
  'ly', 'sd', 'ss', 'rw', 'bi', 'so', 'er', 'dj',
  'ml', 'ne', 'td', 'bf', 'gn', 'sl', 'lr', 'tg', 'bj', 'mr', 'gm', 'gw',
  'cv', 'st', 'ga', 'gq', 'cf', 'ci', 'mg', 'mw', 'zm', 'sz', 'ls',
  'mu', 'sc', 'km',
  // Asien
  'lk', 'np', 'bt', 'mv', 'mn', 'uz', 'tm', 'tj', 'kg',
  'kh', 'la', 'mm', 'tl', 'bn', 'tw', 'kp',
  'ge', 'am', 'az',
  // Mellanöstern
  'ye', 'om', 'bh', 'ps',
  // Oceanien
  'sb', 'vu', 'ws', 'to', 'ki', 'fm', 'mh', 'pw', 'nr', 'tv',
]

const difficultyMap = new Map<string, Difficulty>([
  ...easyCodes.map((code): [string, Difficulty] => [code, 'easy']),
  ...mediumCodes.map((code): [string, Difficulty] => [code, 'medium']),
  ...hardCodes.map((code): [string, Difficulty] => [code, 'hard']),
])

export const capitalQuestions: CapitalQuestion[] = countries
  .filter((c) => difficultyMap.has(c.code))
  .map((c) => ({ ...c, difficulty: difficultyMap.get(c.code)! }))

export function getByDifficulty(difficulty: Difficulty): CapitalQuestion[] {
  return capitalQuestions.filter((q) => q.difficulty === difficulty)
}

import type { CharacterEmotion } from '@talking/types'

export const EMOTION_JP_LABEL: Record<CharacterEmotion, string> = {
  NEUTRAL: '自然体',
  HAPPY: '楽しい',
  SAD: '悲しい',
  ANGRY: '怒り',
  SURPRISED: '驚き',
  FEAR: '恐れ',
  DISGUST: '嫌悪',
  SHY: '照れ',
  SLEEPY: '眠い',
  THINKING: '思案',
  OTHER: 'その他',
}

export const emotionOptions = (withCode = false) =>
  (Object.keys(EMOTION_JP_LABEL) as CharacterEmotion[]).map(k => ({
    value: k,
    label: withCode ? `${EMOTION_JP_LABEL[k]}（${k}）` : EMOTION_JP_LABEL[k],
  }))

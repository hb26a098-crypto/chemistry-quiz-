/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum QuestionType {
  FourChoice = 'FourChoice',
  TrueFalse = 'TrueFalse',
  Text = 'Text',
}

export enum Category {
  Inorganic = 'Inorganic',
  Organic = 'Organic',
}

export interface Question {
  id: string;
  category: Category;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: number | boolean | string[];
  explanation?: string;
}

export interface SaveData {
  weakQuestions: string[];
  mistakeCounters: Record<string, number>;
}

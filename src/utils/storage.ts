/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SaveData } from '../types';

const STORAGE_KEY = 'chemistry_quiz_save';

export function loadSaveData(): SaveData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        weakQuestions: Array.isArray(parsed.weakQuestions) ? parsed.weakQuestions : [],
        mistakeCounters: parsed.mistakeCounters || {},
      };
    }
  } catch (e) {
    console.error('Failed to load save data:', e);
  }
  return {
    weakQuestions: [],
    mistakeCounters: {},
  };
}

export function saveSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

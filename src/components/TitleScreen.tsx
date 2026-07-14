/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Beaker, BrainCircuit, AlertTriangle, BookOpen } from 'lucide-react';

interface TitleScreenProps {
  weakCount: number;
  onStartNormal: () => void;
  onStartWeak: () => void;
  totalQuestions: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  weakCount,
  onStartNormal,
  onStartWeak,
  totalQuestions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
      id="title-screen-container"
    >
      <div className="mb-6 p-4 bg-emerald-50 rounded-full text-emerald-600 shadow-sm" id="title-icon-wrapper">
        <Beaker size={56} className="animate-pulse" id="title-beaker-icon" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-3" id="main-game-title">
        化学クイズゲーム
      </h1>
      
      <p className="text-gray-500 max-w-md mb-10 text-sm leading-relaxed" id="game-subtitle">
        高校化学の無機化学・有機化学からランダムにクイズを出題します。
        繰り返し間違えた問題は「苦手問題モード」で復習しましょう。
        <span className="block mt-2 font-semibold text-emerald-700">総問題数: {totalQuestions}問 収録</span>
      </p>

      <div className="w-full max-w-sm space-y-4" id="title-actions-wrapper">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartNormal}
          className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-colors duration-200 flex items-center justify-center gap-3 cursor-pointer"
          id="btn-start-normal"
        >
          <BookOpen size={20} id="icon-start-normal" />
          通常モードで開始
        </motion.button>

        <div className="flex flex-col items-center w-full" id="weak-mode-container">
          <motion.button
            whileHover={weakCount > 0 ? { scale: 1.02 } : {}}
            whileTap={weakCount > 0 ? { scale: 0.98 } : {}}
            onClick={onStartWeak}
            disabled={weakCount === 0}
            className={`w-full py-4 px-6 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
              weakCount > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
            id="btn-start-weak"
          >
            <BrainCircuit size={20} id="icon-start-weak" />
            苦手問題モードで開始
          </motion.button>
          
          {weakCount === 0 ? (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1" id="weak-empty-text">
              <AlertTriangle size={12} id="icon-weak-empty-alert" />
              現在、苦手問題はありません（通算5回誤答で登録）
            </p>
          ) : (
            <p className="text-xs text-amber-600 font-medium mt-2" id="weak-count-text">
              現在 {weakCount} 問が苦手問題リストに登録されています
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

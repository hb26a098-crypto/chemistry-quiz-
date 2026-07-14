/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Award, Home, Sparkles } from 'lucide-react';

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  onHome: () => void;
  isWeakMode: boolean;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  score,
  totalQuestions,
  onHome,
  isWeakMode,
}) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  let rankText = '合格！よくできました！';
  let rankColor = 'text-emerald-600';
  if (percentage === 100) {
    rankText = '完璧！全問正解です！';
    rankColor = 'text-indigo-600';
  } else if (percentage < 60) {
    rankText = 'もう一息！復習を重ねましょう。';
    rankColor = 'text-amber-600';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center max-w-md mx-auto"
      id="results-screen-container"
    >
      <div className="relative mb-6" id="badge-wrapper">
        <div className="p-5 bg-indigo-50 rounded-full text-indigo-600 shadow-sm" id="award-icon-bg">
          <Award size={64} id="award-icon" />
        </div>
        {percentage >= 80 && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-1 rounded-full animate-bounce" id="sparkles-badge">
            <Sparkles size={16} id="sparkles-icon" />
          </div>
        )}
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-2" id="results-title">
        {isWeakMode ? '苦手問題モード終了' : '結果発表'}
      </h1>

      <p className={`text-lg font-bold mb-6 ${rankColor}`} id="results-rank-text">
        {rankText}
      </p>

      {/* Score Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full mb-8" id="score-board">
        <div className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-1" id="score-label">
          最終スコア
        </div>
        <div className="flex items-baseline justify-center gap-1 mb-2" id="score-fraction">
          <span className="text-5xl font-black text-gray-900" id="correct-count">{score}</span>
          <span className="text-gray-400 text-xl font-medium" id="slash">/</span>
          <span className="text-2xl font-bold text-gray-500" id="total-count">{totalQuestions}</span>
          <span className="text-gray-600 text-lg ml-1 font-medium" id="unit-question">問正解</span>
        </div>
        
        {/* Visual Progress Bar */}
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mt-4 mb-2" id="percentage-bar-bg">
          <div 
            className={`h-full transition-all duration-500 ${
              percentage >= 80 ? 'bg-indigo-500' : percentage >= 50 ? 'bg-emerald-500' : 'bg-amber-500'
            }`} 
            style={{ width: `${percentage}%` }}
            id="percentage-bar-fill"
          />
        </div>
        <div className="text-right text-xs font-semibold text-gray-500 font-mono" id="percentage-text">
          正解率 {percentage}%
        </div>
      </div>

      <div className="w-full" id="results-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onHome}
          className="w-full py-4 px-6 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl shadow-md transition-colors duration-200 flex items-center justify-center gap-3 cursor-pointer"
          id="btn-return-home"
        >
          <Home size={20} id="icon-home" />
          タイトルに戻る
        </motion.button>
      </div>
    </motion.div>
  );
};

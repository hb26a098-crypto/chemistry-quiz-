/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, FileText } from 'lucide-react';
import { Question, QuestionType, Category } from '../types';

interface QuizScreenProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onAnswerSubmit: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onAnswerSubmit,
  onNext,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedBool, setSelectedBool] = useState<boolean | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrectResult, setIsCorrectResult] = useState(false);

  // Reset local interactive state when a new question arrives
  useEffect(() => {
    setSelectedOption(null);
    setSelectedBool(null);
    setTextInput('');
    setIsSubmitted(false);
  }, [question]);

  const normalizeInput = (input: string): string => {
    // Convert full-width alphanumeric to half-width
    let normalized = input.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    // Remove both full-width and half-width whitespaces entirely
    normalized = normalized.replace(/　/g, '').replace(/\s+/g, '');
    // Ignore casing
    return normalized.toLowerCase();
  };

  const handleFourChoiceSubmit = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
    const correct = idx === (question.answer as number);
    setIsCorrectResult(correct);
    setIsSubmitted(true);
    onAnswerSubmit(correct);
  };

  const handleTrueFalseSubmit = (val: boolean) => {
    if (isSubmitted) return;
    setSelectedBool(val);
    const correct = val === (question.answer as boolean);
    setIsCorrectResult(correct);
    setIsSubmitted(true);
    onAnswerSubmit(correct);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted || !textInput.trim()) return;
    
    const allowedAnswers = question.answer as string[];
    const normUser = normalizeInput(textInput);
    const correct = allowedAnswers.some(ans => normalizeInput(ans) === normUser);
    
    setIsCorrectResult(correct);
    setIsSubmitted(true);
    onAnswerSubmit(correct);
  };

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6" id="quiz-screen-wrapper">
      {/* Progress & Category Badge */}
      <div className="mb-6" id="quiz-progress-container">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2 font-mono" id="quiz-progress-info">
          <span className="bg-emerald-50 text-emerald-700 py-1 px-3 rounded-full font-medium" id="quiz-category-badge">
            {question.category === Category.Inorganic ? '無機化学' : '有機化学'}
          </span>
          <span className="font-semibold text-gray-600" id="quiz-counter-text">
            {currentIndex + 1} / {totalQuestions} 問目
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden" id="progress-bar-bg">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-emerald-500"
            id="progress-bar-fill"
          />
        </div>
      </div>

      {/* Main Question Card */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6"
        id={`question-card-${question.id}`}
      >
        <div className="flex items-start gap-3 mb-4" id="question-text-container">
          <HelpCircle className="text-emerald-500 shrink-0 mt-1" size={24} id="question-help-icon" />
          <h2 className="text-xl font-bold text-gray-800 leading-snug" id="question-text">
            {question.question}
          </h2>
        </div>

        {/* Interactive Input/Choice Section */}
        <div className="mt-8" id="answers-interactive-area">
          {question.type === QuestionType.FourChoice && question.options && (
            <div className="space-y-3" id="four-choice-wrapper">
              {question.options.map((option, idx) => {
                let btnStyle = "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/10 text-gray-700";
                
                if (isSubmitted) {
                  if (idx === (question.answer as number)) {
                    btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold";
                  } else if (selectedOption === idx) {
                    btnStyle = "bg-rose-50 border-rose-400 text-rose-800";
                  } else {
                    btnStyle = "opacity-60 border-gray-100 text-gray-400";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleFourChoiceSubmit(idx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-base font-medium min-h-[52px] ${
                      !isSubmitted ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                    } ${btnStyle}`}
                    id={`choice-btn-${idx}`}
                  >
                    <span>{option}</span>
                    {isSubmitted && idx === (question.answer as number) && (
                      <CheckCircle2 size={20} className="text-emerald-600 shrink-0 ml-2" id={`correct-check-${idx}`} />
                    )}
                    {isSubmitted && selectedOption === idx && idx !== (question.answer as number) && (
                      <XCircle size={20} className="text-rose-500 shrink-0 ml-2" id={`incorrect-x-${idx}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === QuestionType.TrueFalse && (
            <div className="grid grid-cols-2 gap-4" id="true-false-wrapper">
              {[true, false].map((val) => {
                let btnStyle = "border-gray-200 text-gray-700";
                
                if (val === true) {
                  if (!isSubmitted) {
                    btnStyle += " hover:border-emerald-400 hover:bg-emerald-50/25";
                  } else {
                    if (question.answer === true) {
                      btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold";
                    } else if (selectedBool === true) {
                      btnStyle = "bg-rose-50 border-rose-400 text-rose-800";
                    } else {
                      btnStyle = "opacity-55 border-gray-100 text-gray-400";
                    }
                  }
                } else {
                  if (!isSubmitted) {
                    btnStyle += " hover:border-rose-400 hover:bg-rose-50/25";
                  } else {
                    if (question.answer === false) {
                      btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold";
                    } else if (selectedBool === false) {
                      btnStyle = "bg-rose-50 border-rose-400 text-rose-800";
                    } else {
                      btnStyle = "opacity-55 border-gray-100 text-gray-400";
                    }
                  }
                }

                return (
                  <button
                    key={val ? 'true' : 'false'}
                    onClick={() => handleTrueFalseSubmit(val)}
                    disabled={isSubmitted}
                    className={`p-6 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                      !isSubmitted ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                    } ${btnStyle}`}
                    id={`true-false-btn-${val}`}
                  >
                    <span className="text-3xl font-extrabold" id={`tf-symbol-${val}`}>
                      {val ? '○' : '×'}
                    </span>
                    <span className="text-sm font-medium" id={`tf-label-${val}`}>
                      {val ? '正しい' : '誤り'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {question.type === QuestionType.Text && (
            <form onSubmit={handleTextSubmit} className="space-y-4" id="text-input-form">
              <div className="flex gap-2" id="text-input-row">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isSubmitted}
                  placeholder="物質名または化学式を入力"
                  className={`flex-1 p-4 rounded-xl border-2 outline-none transition-all duration-200 text-base ${
                    isSubmitted
                      ? 'bg-gray-50 border-gray-200 text-gray-400'
                      : 'border-gray-200 focus:border-emerald-500 focus:bg-white'
                  }`}
                  id="quiz-text-input"
                />
                {!isSubmitted && (
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className={`px-6 py-4 font-semibold rounded-xl text-white transition-all duration-200 shrink-0 ${
                      textInput.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    id="quiz-text-submit-btn"
                  >
                    解答する
                  </button>
                )}
              </div>
              
              {isSubmitted && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1 text-sm text-gray-700 animate-fadeIn" id="correct-answers-display">
                  <span className="font-semibold text-gray-500" id="correct-label">正解：</span>
                  <div className="flex flex-wrap gap-1.5 mt-1" id="correct-answers-pills">
                    {(question.answer as string[]).map((ans, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-150 py-1 px-3 rounded-full font-mono text-xs font-semibold animate-scaleIn" id={`ans-pill-${idx}`}>
                        {ans}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </motion.div>

      {/* Answer Feedback and Explanations */}
      <AnimatePresence id="feedback-presence">
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`rounded-2xl border p-5 sm:p-6 mb-6 ${
              isCorrectResult
                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                : 'bg-rose-50/50 border-rose-100 text-rose-900'
            }`}
            id="feedback-card"
          >
            <div className="flex items-center gap-3 mb-3" id="feedback-header">
              {isCorrectResult ? (
                <div className="flex items-center gap-2 font-bold text-lg text-emerald-700" id="feedback-title-correct">
                  <CheckCircle2 size={24} className="text-emerald-600" id="feedback-icon-correct" />
                  正解です！
                </div>
              ) : (
                <div className="flex items-center gap-2 font-bold text-lg text-rose-700" id="feedback-title-incorrect">
                  <XCircle size={24} className="text-rose-500" id="feedback-icon-incorrect" />
                  不正解です
                </div>
              )}
            </div>

            {question.explanation && (
              <div className="mt-3 text-sm text-gray-600 bg-white/80 rounded-xl p-4 border border-gray-100 leading-relaxed" id="explanation-container">
                <div className="flex items-center gap-1.5 font-bold text-gray-700 mb-1.5 text-xs tracking-wider" id="explanation-header">
                  <FileText size={14} id="explanation-icon" />
                  解説
                </div>
                <p id="explanation-text">{question.explanation}</p>
              </div>
            )}

            <div className="mt-5 flex justify-end" id="next-action-container">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNext}
                className="py-3 px-6 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
                id="btn-next-question"
              >
                <span>{currentIndex + 1 === totalQuestions ? '結果を見る' : '次の問題へ'}</span>
                <ArrowRight size={16} id="next-arrow-icon" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

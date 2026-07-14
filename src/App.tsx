/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { TitleScreen } from './components/TitleScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { Question, SaveData, Category, QuestionType } from './types';
import { loadAllQuestions } from './utils/parser';
import { loadSaveData, saveSaveData } from './utils/storage';
import { Beaker } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<'loading' | 'title' | 'quiz' | 'results'>('loading');
  const [questionsPool, setQuestionsPool] = useState<Question[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isWeakMode, setIsWeakMode] = useState(false);
  const [saveData, setSaveData] = useState<SaveData>({ weakQuestions: [], mistakeCounters: {} });

  // Load questions and local save data on mount
  useEffect(() => {
    try {
      const allQs = loadAllQuestions();
      setQuestionsPool(allQs);
      
      const saved = loadSaveData();
      setSaveData(saved);
      
      setGameState('title');
    } catch (e) {
      console.error('Error initializing application:', e);
      setGameState('title');
    }
  }, []);

  const startNormalMode = () => {
    // Select 4 questions from Inorganic and 4 from Organic
    const inorganicPool = questionsPool.filter(q => q.category === Category.Inorganic);
    const organicPool = questionsPool.filter(q => q.category === Category.Organic);

    const selectByFormat = (pool: Question[]): Question[] => {
      const fourChoice = pool.filter(q => q.type === QuestionType.FourChoice);
      const trueFalse = pool.filter(q => q.type === QuestionType.TrueFalse);
      const textType = pool.filter(q => q.type === QuestionType.Text);

      const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

      const selectedFourChoice = shuffle(fourChoice).slice(0, 2);
      const selectedTrueFalse = shuffle(trueFalse).slice(0, 1);
      const selectedText = shuffle(textType).slice(0, 1);

      return [...selectedFourChoice, ...selectedTrueFalse, ...selectedText];
    };

    const selectedInorganic = selectByFormat(inorganicPool);
    const selectedOrganic = selectByFormat(organicPool);

    // Shuffle the combined 8 questions
    const finalSelection = [...selectedInorganic, ...selectedOrganic].sort(() => Math.random() - 0.5);

    setActiveQuestions(finalSelection);
    setCurrentIndex(0);
    setScore(0);
    setIsWeakMode(false);
    setGameState('quiz');
  };

  const startWeakMode = () => {
    if (saveData.weakQuestions.length === 0) return;

    // Filter questions that are in the weak questions list
    const selected = questionsPool.filter(q => saveData.weakQuestions.includes(q.id));
    
    // Shuffle the weak questions
    const shuffledSelection = [...selected].sort(() => Math.random() - 0.5);

    setActiveQuestions(shuffledSelection);
    setCurrentIndex(0);
    setScore(0);
    setIsWeakMode(true);
    setGameState('quiz');
  };

  const handleAnswerSubmit = (isCorrect: boolean) => {
    const currentQuestion = activeQuestions[currentIndex];
    const updatedCounters = { ...saveData.mistakeCounters };
    let updatedWeakQuestions = [...saveData.weakQuestions];

    if (isCorrect) {
      setScore(prev => prev + 1);

      // If playing weak problem mode and answered correctly, remove from list and reset counter
      if (isWeakMode) {
        updatedWeakQuestions = updatedWeakQuestions.filter(id => id !== currentQuestion.id);
        updatedCounters[currentQuestion.id] = 0;
      }
    } else {
      // If wrong answer, increment cumulative mistake counter
      const currentCount = (updatedCounters[currentQuestion.id] || 0) + 1;
      updatedCounters[currentQuestion.id] = currentCount;

      // Automatically register to weak list if cumulative count reaches 5
      if (currentCount >= 5 && !updatedWeakQuestions.includes(currentQuestion.id)) {
        updatedWeakQuestions.push(currentQuestion.id);
      }
    }

    const newSaveData = {
      weakQuestions: updatedWeakQuestions,
      mistakeCounters: updatedCounters,
    };
    setSaveData(newSaveData);
    saveSaveData(newSaveData);
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameState('results');
    }
  };

  const returnToTitle = () => {
    setGameState('title');
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center" id="loading-spinner-container">
        <Beaker size={48} className="text-emerald-600 animate-spin mb-4" id="loading-spinner-icon" />
        <p className="text-gray-500 font-medium text-sm animate-pulse" id="loading-spinner-text">
          問題データをロードしています...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between" id="app-root-layout">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 shadow-xs flex items-center justify-between" id="main-app-header">
        <div className="flex items-center gap-2 cursor-pointer" onClick={returnToTitle} id="header-logo-wrapper">
          <Beaker size={24} className="text-emerald-600" id="header-logo-icon" />
          <span className="font-extrabold text-lg text-gray-800 tracking-tight" id="header-logo-text">
            化学クイズ
          </span>
        </div>
        <div className="text-xs text-gray-400 font-mono font-medium" id="header-meta">
          Ver. 1.0.0
        </div>
      </header>

      {/* Main Screen Content with Page Transitions */}
      <main className="flex-1 flex flex-col justify-center py-8" id="main-content-section">
        <AnimatePresence mode="wait" id="screen-transition-presence">
          {gameState === 'title' && (
            <TitleScreen
              key="title"
              weakCount={saveData.weakQuestions.length}
              onStartNormal={startNormalMode}
              onStartWeak={startWeakMode}
              totalQuestions={questionsPool.length}
            />
          )}

          {gameState === 'quiz' && activeQuestions.length > 0 && (
            <QuizScreen
              key="quiz"
              question={activeQuestions[currentIndex]}
              currentIndex={currentIndex}
              totalQuestions={activeQuestions.length}
              onAnswerSubmit={handleAnswerSubmit}
              onNext={handleNext}
            />
          )}

          {gameState === 'results' && (
            <ResultsScreen
              key="results"
              score={score}
              totalQuestions={activeQuestions.length}
              onHome={returnToTitle}
              isWeakMode={isWeakMode}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer Bar */}
      <footer className="bg-white border-t border-gray-100 py-4 px-6 text-center text-xs text-gray-400 font-medium" id="main-app-footer">
        &copy; {new Date().getFullYear()} 化学クイズゲーム. All rights reserved.
      </footer>
    </div>
  );
}

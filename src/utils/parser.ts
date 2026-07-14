/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, QuestionType, Category } from '../types';

function cleanChemicalFormulas(str: string): string {
  let result = str;
  
  // 1. Replace LaTeX arrows with standard unicode arrows
  result = result.replace(/\\rightleftarrows/g, '⇄');
  result = result.replace(/\\rightarrow/g, '→');
  result = result.replace(/\\leftarrow/g, '←');
  result = result.replace(/\\uparrow/g, '↑');
  result = result.replace(/\\downarrow/g, '↓');
  
  // 2. Translate common math/chemistry LaTeX operators
  result = result.replace(/\\times/g, ' × ');
  result = result.replace(/\\implies/g, ' ⇒ ');
  result = result.replace(/\\cdot/g, '・');
  
  // 3. Handle fractions: \frac{A}{B} -> (A/B)
  for (let k = 0; k < 5; k++) {
    const next = result.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1/$2)');
    if (next === result) break;
    result = next;
  }
  
  // 4. Handle \text{...}
  for (let k = 0; k < 5; k++) {
    const next = result.replace(/\\text\{([^{}]+)\}/g, '$1');
    if (next === result) break;
    result = next;
  }
  
  // 5. Remove superscript carat syntax: ^{3+} -> 3+, ^+ -> +
  result = result.replace(/\^\{([^}]+)\}/g, '$1');
  result = result.replace(/\^/g, '');
  
  // 6. Remove chemical subscripts syntax (e.g. _{2} -> 2, _2 -> 2)
  result = result.replace(/_\{([^}]+)\}/g, '$1');
  result = result.replace(/_/g, '');
  
  // 7. Remove LaTeX dollar signs
  result = result.replace(/\$/g, '');
  
  // 8. Clean up any remaining backslashes
  result = result.replace(/\\/g, '');
  
  return result;
}

export function parseMarkdownQuestions(filePath: string, content: string): Question[] {
  const questions: Question[] = [];
  
  // Determine standard category from file path
  let fileCategory = Category.Inorganic;
  const lowerPath = filePath.toLowerCase();
  if (lowerPath.includes('organic') || lowerPath.includes('highmolecular')) {
    fileCategory = Category.Organic;
  }

  // Split on "### 【問" to parse each question block
  const blocks = content.split(/###\s+【問\d+】/);
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    // 1. Extract ID
    const idMatch = block.match(/\*\s*\*\*ID\*\*:\s*`([^`]+)`/i);
    if (!idMatch) continue;
    const id = idMatch[1].trim();

    // 2. Extract Question Type
    const typeMatch = block.match(/\*\s*\*\*問題タイプ\*\*:\s*(.+)/i);
    if (!typeMatch) continue;
    const typeText = typeMatch[1].trim();
    let type = QuestionType.FourChoice;
    if (typeText.includes('○×') || typeText.includes('TrueFalse')) {
      type = QuestionType.TrueFalse;
    } else if (typeText.includes('記述') || typeText.includes('Text')) {
      type = QuestionType.Text;
    }

    // 3. Set Category based on ID or File Path
    let category = fileCategory;
    if (id.startsWith('INORG') || id.startsWith('ANL')) {
      category = Category.Inorganic;
    } else if (id.startsWith('ORG') || id.startsWith('HIGH')) {
      category = Category.Organic;
    }

    // 4. Extract Question Text
    const questionMatch = block.match(/\*\s*\*\*問題文\*\*:\s*([\s\S]+?)(?=\n\s*\*\s*\*\*|\n\s*---|$\n?)/i);
    if (!questionMatch) continue;
    const question = cleanChemicalFormulas(questionMatch[1].trim());

    // 5. Extract Options for FourChoice
    let options: string[] = [];
    if (type === QuestionType.FourChoice) {
      const optionsMatch = block.match(/\*\s*\*\*選択肢\*\*:\s*([\s\S]+?)(?=\n\s*\*\s*\*\*|\n\s*---|$\n?)/i);
      if (optionsMatch) {
        const lines = optionsMatch[1].split('\n');
        for (const line of lines) {
          const optMatch = line.match(/^\s*\*\s*\[(\d+)\]\s*(.+)$/);
          if (optMatch) {
            options.push(cleanChemicalFormulas(optMatch[2].trim()));
          }
        }
      }
    }

    // 6. Extract Answer
    let answer: number | boolean | string[] = 0;
    if (type === QuestionType.FourChoice) {
      const ansMatch = block.match(/\*\s*\*\*正解\*\*:\s*`(\d+)`/i);
      answer = ansMatch ? parseInt(ansMatch[1], 10) : 0;
    } else if (type === QuestionType.TrueFalse) {
      const ansMatch = block.match(/\*\s*\*\*正解\*\*:\s*`([^`]+)`/i);
      answer = ansMatch ? ansMatch[1].trim().toLowerCase() === 'true' : false;
    } else if (type === QuestionType.Text) {
      const ansMatch = block.match(/\*\s*\*\*正解(?:（許容リスト）)?\*\*:\s*`([^`]+)`/i);
      if (ansMatch) {
        try {
          const parsed = JSON.parse(ansMatch[1]);
          answer = Array.isArray(parsed) ? parsed.map(s => cleanChemicalFormulas(String(s).trim())) : [cleanChemicalFormulas(ansMatch[1].trim())];
        } catch (e) {
          answer = [cleanChemicalFormulas(ansMatch[1].trim())];
        }
      } else {
        answer = [];
      }
    }

    // 7. Extract Explanation
    const expMatch = block.match(/\*\s*\*\*解説\*\*:\s*([\s\S]+?)(?=\n\s*---|$\n?)/i);
    const explanation = expMatch ? cleanChemicalFormulas(expMatch[1].trim()) : '';

    questions.push({
      id,
      category,
      type,
      question,
      options: type === QuestionType.FourChoice ? options : undefined,
      answer,
      explanation,
    });
  }

  return questions;
}

export function loadAllQuestions(): Question[] {
  const modules = import.meta.glob('/file/*.md', { query: '?raw', eager: true });
  const allQuestions: Question[] = [];

  for (const filePath in modules) {
    const mod = modules[filePath] as any;
    const content = typeof mod === 'string' ? mod : (mod.default || mod);
    if (typeof content === 'string') {
      const qs = parseMarkdownQuestions(filePath, content);
      allQuestions.push(...qs);
    }
  }

  return allQuestions;
}

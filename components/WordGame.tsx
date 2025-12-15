'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { questions } from '@/data/questions';

interface GridCell {
  letter: string;
  row: number;
  col: number;
  id: string;
}

export default function WordGame() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedPath, setSelectedPath] = useState<GridCell[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const GRID_SIZE = 10; // 10x10 grid

  // Create 2D grid of letters with answer word placed horizontally or vertically
  const { letterGrid, answerPath } = useMemo(() => {
    if (!currentQuestion) return { letterGrid: [], answerPath: [] };

    const answerLetters = currentQuestion.answer
      .split('')
      .filter((char) => char !== ' ');

    const extraLetters = [
      'أ',
      'ب',
      'ت',
      'ث',
      'ج',
      'ح',
      'خ',
      'د',
      'ذ',
      'ر',
      'ز',
      'س',
      'ش',
      'ص',
      'ض',
      'ط',
      'ظ',
      'ع',
      'غ',
      'ف',
      'ق',
      'ك',
      'ل',
      'م',
      'ن',
      'ه',
      'و',
      'ي',
    ];

    // Filter out letters that are already in the answer
    const availableExtra = extraLetters.filter(
      (letter) => !answerLetters.includes(letter)
    );

    // Use question ID as seed for consistent grid per question
    const seed = currentQuestion.id;

    // Create empty grid
    const grid: GridCell[][] = [];
    const answerCells: GridCell[] = [];

    // Initialize grid with random letters
    for (let row = 0; row < GRID_SIZE; row++) {
      const rowCells: GridCell[] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        const cellIndex =
          (row * GRID_SIZE + col + seed) % availableExtra.length;
        rowCells.push({
          letter: availableExtra[cellIndex],
          row,
          col,
          id: `${row}-${col}`,
        });
      }
      grid.push(rowCells);
    }

    // Place answer word horizontally or vertically
    const wordLength = answerLetters.length;
    const isHorizontal = currentQuestion.direction === 'horizontal';

    if (isHorizontal) {
      // Place horizontally - find a valid row and starting column
      const startRow = seed % GRID_SIZE;
      const startCol = Math.max(
        0,
        Math.min(seed % (GRID_SIZE - wordLength + 1), GRID_SIZE - wordLength)
      );

      // Place the answer letters horizontally
      for (let i = 0; i < wordLength; i++) {
        const col = startCol + i;
        const cell = grid[startRow][col];
        cell.letter = answerLetters[i];
        answerCells.push(cell);
      }
    } else {
      // Place vertically - find a valid column and starting row
      const startCol = seed % GRID_SIZE;
      const startRow = Math.max(
        0,
        Math.min(seed % (GRID_SIZE - wordLength + 1), GRID_SIZE - wordLength)
      );

      // Place the answer letters vertically
      for (let i = 0; i < wordLength; i++) {
        const row = startRow + i;
        const cell = grid[row][startCol];
        cell.letter = answerLetters[i];
        answerCells.push(cell);
      }
    }

    return { letterGrid: grid, answerPath: answerCells };
  }, [currentQuestion]);

  // Reset state when question changes
  const resetGameState = () => {
    setSelectedPath([]);
    setMessage('');
    setIsCorrect(null);
    setIsDrawing(false);
  };

  useEffect(() => {
    resetGameState();
  }, [currentQuestionIndex]);

  // Check if two cells are adjacent (horizontally, vertically, or diagonally)
  const isAdjacent = (cell1: GridCell, cell2: GridCell): boolean => {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  };

  // Get cell from mouse/touch position
  const getCellFromPosition = (
    clientX: number,
    clientY: number
  ): GridCell | null => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const cellWidth = rect.width / GRID_SIZE;
    const cellHeight = rect.height / GRID_SIZE;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return letterGrid[row][col];
    }

    return null;
  };

  // Handle cell selection during drawing
  const handleCellSelect = (cell: GridCell) => {
    if (isCorrect === true) return;

    if (selectedPath.length === 0) {
      // Start new path
      setSelectedPath([cell]);
      setIsDrawing(true);
      setMessage('');
    } else {
      const lastCell = selectedPath[selectedPath.length - 1];

      // Check if this cell is already in the path (allow going back)
      const existingIndex = selectedPath.findIndex((c) => c.id === cell.id);

      if (existingIndex !== -1) {
        // Remove all cells after this one (allows undoing)
        setSelectedPath(selectedPath.slice(0, existingIndex + 1));
      } else if (isAdjacent(lastCell, cell)) {
        // Add adjacent cell to path
        setSelectedPath([...selectedPath, cell]);
      }
    }
  };

  // Mouse/touch event handlers
  const handleMouseDown = (cell: GridCell) => {
    if (isCorrect === true) return;
    handleCellSelect(cell);
  };

  const handleMouseEnter = (cell: GridCell) => {
    if (isCorrect === true || !isDrawing) return;
    handleCellSelect(cell);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e: React.TouchEvent, cell: GridCell) => {
    if (isCorrect === true) return;
    e.preventDefault(); // Prevent scrolling and other default behaviors
    handleCellSelect(cell);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isCorrect === true || !isDrawing) return;
    e.preventDefault(); // Prevent scrolling while drawing

    const touch = e.touches[0];
    if (!touch) return;
    
    const cell = getCellFromPosition(touch.clientX, touch.clientY);
    if (cell) {
      handleCellSelect(cell);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  // Get selected letters as string
  const selectedWord = selectedPath.map((cell) => cell.letter).join('');

  const handleCheckAnswer = () => {
    if (selectedPath.length === 0) {
      setMessage('الرجاء رسم الكلمة أولاً');
      return;
    }

    const correctAnswer = currentQuestion.answer.replace(/\s/g, '');

    // Check if the selected path matches the answer path (same cells in same order)
    const isPathMatch =
      selectedPath.length === answerPath.length &&
      selectedPath.every((cell, index) => cell.id === answerPath[index].id);

    // Also check if the word matches (allows for correct word even if drawn in reverse)
    const wordMatches = selectedWord === correctAnswer;
    const reversedWord = selectedPath
      .map((cell) => cell.letter)
      .reverse()
      .join('');
    const reversedMatches = reversedWord === correctAnswer;

    if (isPathMatch || wordMatches || reversedMatches) {
      setIsCorrect(true);
      setMessage('إجابة صحيحة! ✓');

      setTimeout(() => {
        if (isLastQuestion) {
          // Move to completion screen by setting index beyond questions array
          setCurrentQuestionIndex(questions.length);
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      setMessage('إجابة خاطئة، حاول مرة أخرى');
    }
  };

  const handleClear = () => {
    if (isCorrect === true) return;
    setSelectedPath([]);
    setMessage('');
    setIsDrawing(false);
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      resetGameState();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Check if a cell is in the selected path
  const isCellSelected = (cell: GridCell): boolean => {
    return selectedPath.some((c) => c.id === cell.id);
  };

  // Get the index of a cell in the path for visual ordering
  const getPathIndex = (cell: GridCell): number => {
    return selectedPath.findIndex((c) => c.id === cell.id);
  };

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-3 sm:p-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 text-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute top-10 left-10 text-9xl">🎉</div>
            <div className="absolute top-20 right-20 text-7xl">✨</div>
            <div className="absolute bottom-20 left-20 text-8xl">🏆</div>
            <div className="absolute bottom-10 right-10 text-6xl">⭐</div>
          </div>

          <div className="relative z-10">
            {/* Success Icon */}
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mb-3 sm:mb-4">
              مبروك! 🎊
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-2 sm:mb-3">
              لقد أكملت جميع الأسئلة
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8">
              لقد أظهرت مهارة عالية في البحث عن الكلمات العربية
            </p>

            {/* Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 border-2 border-blue-200">
              <div className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {questions.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">سؤال</div>
                </div>
                <div className="w-px h-8 sm:h-10 md:h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">مكتمل</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => {
                  resetGameState();
                  setCurrentQuestionIndex(0);
                }}
                className="px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base md:text-lg cursor-pointer"
              >
                🔄 إعادة اللعبة
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base md:text-lg cursor-pointer"
              >
                🏠 العودة للبداية
              </button>
            </div>

            {/* Celebration Message */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-xs sm:text-sm md:text-base text-gray-500 italic">
                شكراً لك على مشاركتك في اليوم العالمي للغة العربية
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-1 sm:mb-2">
            لعبة البحث عن الكلمات
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">اليوم العالمي للغة العربية</p>
        </div>

        {/* Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              السؤال {currentQuestionIndex + 1} من {questions.length}
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {currentQuestion.direction === 'horizontal' ? 'أفقي' : 'عمودي'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 border-r-4 border-blue-600">
          <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 text-right leading-relaxed">
            {currentQuestion.definition}
          </p>
        </div>

        {/* Selected Word Display */}
        <div className="mb-4 sm:mb-6">
          <div className="relative min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-inner flex items-center justify-center">
            {selectedPath.length === 0 ? (
              <p className="text-gray-400 text-center text-sm sm:text-base md:text-xl">
                ارسم الكلمة في الشبكة أدناه
              </p>
            ) : (
              <div className="relative text-center" dir="rtl">
                <span
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold inline-block ${
                    isCorrect === true ? 'text-green-600' : 'text-blue-800'
                  }`}
                  style={{
                    letterSpacing: '0',
                    wordSpacing: '0',
                    fontFeatureSettings: '"liga" 1, "calt" 1',
                    fontFamily: 'Arial, "Segoe UI", Tahoma, sans-serif',
                    unicodeBidi: 'bidi-override',
                  }}
                >
                  {selectedWord}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Letter Grid */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 text-right">
            ارسم الكلمة في الشبكة:
          </h3>
          <div
            ref={gridRef}
            className="grid gap-0.5 sm:gap-1 bg-blue-100 p-1 sm:p-2 rounded-lg select-none"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              aspectRatio: '1',
              touchAction: 'none', // Prevent default touch behaviors like scrolling
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchCancel={handleTouchEnd}
          >
            {letterGrid.map((row) =>
              row.map((cell) => {
                const selected = isCellSelected(cell);
                const pathIndex = getPathIndex(cell);
                const isHighlighted = selected && pathIndex !== -1;

                return (
                  <div
                    key={cell.id}
                    className={`
                      aspect-square flex items-center justify-center
                      text-base sm:text-lg md:text-2xl lg:text-3xl font-bold
                      rounded transition-all cursor-pointer
                      ${
                        selected
                          ? isCorrect === true
                            ? 'bg-green-400 text-green-900'
                            : 'bg-blue-400 text-blue-900 shadow-md scale-105'
                          : 'bg-white text-gray-800 hover:bg-blue-100'
                      }
                      ${isCorrect === true ? 'cursor-not-allowed' : ''}
                    `}
                    onMouseDown={() => handleMouseDown(cell)}
                    onMouseEnter={() => handleMouseEnter(cell)}
                    onTouchStart={(e) => handleTouchStart(e, cell)}
                    style={{
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                      touchAction: 'none',
                      position: 'relative',
                    }}
                  >
                    {cell.letter}
                    {isHighlighted && pathIndex > 0 && (
                      <div
                        className="absolute inset-0 border-2 border-blue-600 rounded"
                        style={{ zIndex: 1 }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 text-center mt-1 sm:mt-2">
            اضغط واسحب على الحروف لرسم الكلمة
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg text-center text-sm sm:text-base md:text-lg font-semibold ${
              isCorrect === true
                ? 'bg-green-100 text-green-800'
                : isCorrect === false
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center">
          <button
            onClick={handleClear}
            disabled={selectedPath.length === 0 || isCorrect === true}
            className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm sm:text-base font-medium"
          >
            مسح
          </button>
          <button
            onClick={handleCheckAnswer}
            disabled={selectedPath.length === 0 || isCorrect === true}
            className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer text-sm sm:text-base"
          >
            التحقق من الإجابة
          </button>
          {isCorrect === true && !isLastQuestion && (
            <button
              onClick={handleNextQuestion}
              className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold cursor-pointer text-sm sm:text-base"
            >
              السؤال التالي →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

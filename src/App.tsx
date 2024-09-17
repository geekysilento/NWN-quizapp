import React, { useEffect } from "react";
import { Progress } from "./components/ui/progress";

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const fallbackQuestions: Question[] = [
  {
    type: "multiple",
    difficulty: "easy",
    category: "Geography",
    question:
      "All of the following are classified as Finno-Ugric languages EXCEPT:",
    correct_answer: "Samoyedic",
    incorrect_answers: ["Hungarian", "Finnish", "Estonian"],
  },
  {
    type: "multiple",
    difficulty: "easy",
    category: "Geography",
    question: "How many stars are featured on New Zealand's flag?",
    correct_answer: "4",
    incorrect_answers: ["5", "2", "0"],
  },
  {
    type: "multiple",
    difficulty: "easy",
    category: "Geography",
    question: "What is the official language of Costa Rica?",
    correct_answer: "Spanish",
    incorrect_answers: ["English", "Portuguese", "Creole"],
  },
  {
    type: "multiple",
    difficulty: "easy",
    category: "Geography",
    question: "Which ocean borders the west coast of the United States?",
    correct_answer: "Pacific",
    incorrect_answers: ["Atlantic", "Indian", "Arctic"],
  },
  {
    type: "multiple",
    difficulty: "easy",
    category: "Geography",
    question: "Which Russian oblast forms a border with Poland?",
    correct_answer: "Kaliningrad",
    incorrect_answers: ["Samara", "Nizhny Novgorod", "Omsk"],
  },
  {
    type: "multiple",
    difficulty: "easy",
    category: "Geography",
    question: "What is the capital of Denmark?",
    correct_answer: "Copenhagen",
    incorrect_answers: ["Aarhus", "Odense", "Aalborg"],
  },
];

const App: React.FC = () => {
  const [quizQuestions, setQuizQuestions] = React.useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [currentScore, setCurrentScore] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(
    null
  );
  const [timeLeft, setTimeLeft] = React.useState(10);
  const [isQuizComplete, setIsQuizComplete] = React.useState(false);
  const [highScore, setHighScore] = React.useState<number | null>(null);

  useEffect(() => {
    // load high score from localStorage
    const savedHighScore = localStorage.getItem("highScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    if (isQuizComplete && currentScore > (highScore || 0)) {
      // update high score in localStorage
      localStorage.setItem("highScore", currentScore.toString());
      setHighScore(currentScore); // update the state with new high score
    }
  }, [isQuizComplete, currentScore]);

  useEffect(() => {
    fetch(
      "https://opentdb.com/api.php?amount=10&category=23&difficulty=easy&type=multiple"
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          setQuizQuestions(data.results);
        } else {
          setQuizQuestions(fallbackQuestions); // fallback to dummy data if API fails
        }
      });
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleNextQuestion(); //auto move to next question
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  useEffect(() => {
    // Reset timer
    setTimeLeft(10);
  }, [currentQuestionIndex]);

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === quizQuestions[currentQuestionIndex].correct_answer) {
      setCurrentScore(currentScore + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quizQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
    } else {
      setIsQuizComplete(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setCurrentScore(0);
    setSelectedAnswer(null);
    setIsQuizComplete(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-8">
        {isQuizComplete ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              You scored {currentScore} out of {quizQuestions.length}
            </h2>
            <button
              onClick={restartQuiz}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between">
                <div className="text-lg mb-2">
                  <span className="font-semibold">
                    Question {currentQuestionIndex + 1}
                  </span>{" "}
                  of {quizQuestions.length}
                </div>
                <div>
                  <span className="font-semibold">Time Left {timeLeft}s </span>
                </div>
              </div>
              <div className="text-xl font-medium">
                {quizQuestions[currentQuestionIndex]?.question}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              {quizQuestions[currentQuestionIndex]?.incorrect_answers
                .concat(quizQuestions[currentQuestionIndex]?.correct_answer)
                .sort()
                .map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(answer)}
                    disabled={selectedAnswer !== null}
                    className={`w-full px-4 py-2 text-left rounded-lg border transition ${
                      selectedAnswer === answer
                        ? answer ===
                          quizQuestions[currentQuestionIndex]?.correct_answer
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {answer}
                  </button>
                ))}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition disabled:bg-blue-300"
            >
              Next
            </button>
            <section className="mt-4 flex">
              <Progress
                value={(currentQuestionIndex / quizQuestions.length) * 100}
                className="w-[60%] mx-auto"
              />
              <div className="text-semibold">
                High Score: {highScore ?? "No high score yet"}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default App;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { studentAPI } from '../services/api';
import toast from 'react-hot-toast';

const StudentExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const previewExam = location.state?.previewExam || null;
  const previewMode = !!location.state?.previewMode;

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);

  useEffect(() => {
    if (previewExam) {
      setExam(previewExam);
      setTimeLeft((previewExam.duration || 0) * 60);
      return;
    }
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const res = await studentAPI.getPublishedExamById(id);
      const examData = res.data?.exam || null;
      if (!examData) {
        toast.error('Exam not found or not published.');
        navigate('/courses');
        return;
      }

      setExam(examData);
      setTimeLeft((examData.duration || 0) * 60);
    } catch (err) {
      if (previewExam) {
        setExam(previewExam);
        setTimeLeft((previewExam.duration || 0) * 60);
      } else {
        toast.error("Failed to load exam");
      }
    }
  };

  // TIMER
  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && exam) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswer = (qIndex, optionIndex) => {
    setAnswers({
      ...answers,
      [qIndex]: optionIndex
    });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    if (!exam?.questions?.length) {
      toast.error('This exam has no questions yet.');
      return;
    }

    let total = 0;
    let earned = 0;

    exam.questions.forEach((q, i) => {
      total += q.points;
      if (answers[i] === q.correctAnswer) {
        earned += q.points;
      }
    });

    setScore({ earned, total });
    setSubmitted(true);

    if (!previewMode) {
      try {
        await studentAPI.submitExamWithFile({
          examId: exam._id,
          answers,
          score: earned,
          submissionFile
        });
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSubmissionFile(null);
      return;
    }
    setSubmissionFile(file);
  };

  if (!exam) return <div className="p-10">Loading...</div>;

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Exam Finished</h1>
        <p className="text-xl">
          Score: {score.earned} / {score.total}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{exam.title}</h1>

      <div className="mb-6 text-red-600 font-bold">
        Time Left: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, '0')}
      </div>

      {(exam.questions || []).map((q, qIndex) => (
        <div key={qIndex} className="border p-4 mb-4 rounded">
          <h3 className="font-semibold mb-2">
            {qIndex + 1}. {q.questionText}
          </h3>

          {q.options.map((opt, optIndex) => (
            <label key={optIndex} className="block">
              <input
                type="radio"
                name={`q-${qIndex}`}
                checked={answers[qIndex] === optIndex}
                onChange={() => handleAnswer(qIndex, optIndex)}
              />
              <span className="ml-2">{opt}</span>
            </label>
          ))}
        </div>
      ))}

      <div className="border p-4 mb-4 rounded">
        <label className="block font-semibold mb-2">Upload exam file (optional)</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        />
        {submissionFile && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {submissionFile.name}
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Submit Exam
      </button>
    </div>
  );
};

export default StudentExam;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaClock, FaFileAlt, FaQuestionCircle } from 'react-icons/fa';
import { studentAPI } from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [publishedExams, setPublishedExams] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);

  useEffect(() => {
    const fetchPublishedCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await studentAPI.getPublishedCourses();
        setCourses(Array.isArray(res.data?.courses) ? res.data.courses : []);
      } catch (err) {
        console.error('Failed to fetch published courses', err);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    const fetchPublishedExams = async () => {
      try {
        setLoadingExams(true);
        const res = await studentAPI.getPublishedExams();
        setPublishedExams(Array.isArray(res.data?.exams) ? res.data.exams : []);
      } catch (err) {
        console.error('Failed to fetch published exams', err);
        setPublishedExams([]);
      } finally {
        setLoadingExams(false);
      }
    };

    fetchPublishedCourses();
    fetchPublishedExams();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">Published Courses</h1>
        <p className="text-xl text-center text-gray-600 mb-12">Only published courses and exams are visible to students</p>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Published Exams</h2>
          {loadingExams ? (
            <div className="bg-white rounded-xl shadow p-6 text-gray-600">Loading published exams...</div>
          ) : publishedExams.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 text-gray-600">No published exams available right now.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedExams.map((exam) => (
                <div key={exam._id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{exam.description || 'No description'}</p>
                  <div className="text-sm text-gray-500 mb-4 space-y-1">
                    <p className="capitalize">Course: {exam.course}</p>
                    <p>Duration: {exam.duration} min</p>
                    <p>Questions: {exam.questions?.length || 0}</p>
                  </div>
                  <Link
                    to={`/student/exams/${exam._id}`}
                    className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Start Exam
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Courses</h2>
        {loadingCourses ? (
          <div className="bg-white rounded-xl shadow p-6 text-gray-600">Loading published courses...</div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-gray-600">No published courses available right now.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
              >
                <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FaBook className="text-white text-5xl" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{course.description || 'No description yet.'}</p>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <FaFileAlt className="mr-2" />
                    <span>{course.chapterCount || 0} chapters</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <FaQuestionCircle className="mr-2" />
                    <span>Published exams visible</span>
                    <FaClock className="ml-4 mr-2" />
                    <span>Self-paced</span>
                  </div>
                  <button className="w-full btn-primary">Open Course</button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaCheckCircle, FaClock, FaChartLine, 
  FaSearch, FaUserCheck, FaTrash, FaSignOutAlt,
  FaFileAlt, FaPlus, FaEdit, FaTimes, FaBook, FaHourglassHalf,
  FaQuestionCircle, FaEye, FaCopy,
  FaFilePdf, FaFilePowerpoint, FaImage, FaVideo, FaFileWord
} from 'react-icons/fa';
import { adminAPI, resolveMediaUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';

const languageMeta = {
  english: { label: 'English', flag: '🇬🇧' },
  amharic: { label: 'Amharic (አማርኛ)', flag: '🇪🇹' },
  somali: { label: 'Somali', flag: '🇸🇴' }
};

const translations = {
  english: {
    adminDashboard: 'Admin Dashboard',
    managePlatform: 'Manage users, exams, courses and platform',
    administrator: 'Administrator',
    logout: 'Logout',
    changeLanguage: 'Change Language',
    totalUsers: 'Total Users',
    approved: 'Approved',
    pending: 'Pending',
    exams: 'Exams',
    userManagement: 'User Management',
    examManagement: 'Exam Management',
    courseManagement: 'Course Management'
  },
  amharic: {
    adminDashboard: 'የአስተዳዳሪ ዳሽቦርድ',
    managePlatform: 'ተጠቃሚዎችን፣ ፈተናዎችን፣ ኮርሶችን እና ፕላትፎርሙን ያስተዳድሩ',
    administrator: 'አስተዳዳሪ',
    logout: 'ውጣ',
    changeLanguage: 'ቋንቋ ቀይር',
    totalUsers: 'ጠቅላላ ተጠቃሚዎች',
    approved: 'የተፈቀዱ',
    pending: 'በመጠባበቅ ላይ',
    exams: 'ፈተናዎች',
    userManagement: 'የተጠቃሚ አስተዳደር',
    examManagement: 'የፈተና አስተዳደር',
    courseManagement: 'የኮርስ አስተዳደር'
  },
  somali: {
    adminDashboard: 'Dashboard-ka Maamulka',
    managePlatform: 'Maamul isticmaaleyaasha, imtixaannada, koorsooyinka iyo madasha',
    administrator: 'Maamule',
    logout: 'Ka Bax',
    changeLanguage: 'Beddel Luuqadda',
    totalUsers: 'Wadarta Isticmaaleyaasha',
    approved: 'La Ansixiyay',
    pending: 'Sugaya',
    exams: 'Imtixaanno',
    userManagement: 'Maareynta Isticmaaleyaasha',
    examManagement: 'Maareynta Imtixaanka',
    courseManagement: 'Maareynta Koorsooyinka'
  }
};

const normalizeExamQuestion = (question) => {
  const options = Array.isArray(question?.options)
    ? question.options
    : Array.isArray(question?.choices)
      ? question.choices
      : [];

  let correctAnswer = question?.correctAnswer;
  if (typeof correctAnswer !== 'number') {
    const parsedCorrectAnswer = Number(correctAnswer);
    correctAnswer = Number.isInteger(parsedCorrectAnswer) ? parsedCorrectAnswer : 0;
  }

  return {
    ...question,
    questionText: question?.questionText || question?.question || question?.text || '',
    options,
    correctAnswer,
    points: Number(question?.points) > 0 ? Number(question.points) : 1,
  };
};

const normalizeExam = (exam) => ({
  ...exam,
  questions: Array.isArray(exam?.questions) ? exam.questions.map(normalizeExamQuestion) : [],
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { language, cycleLanguage } = useLanguage();
  const activeLanguage = languageMeta[language];
  const t = translations[language] || translations.english;

  // Users State
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 6;
  const [showStudentCard, setShowStudentCard] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [cardPhotoPreview, setCardPhotoPreview] = useState('');
  const totalUserPages = Math.max(1, Math.ceil(users.length / usersPerPage));
  const paginatedUsers = users.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  // Exams State
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);
  const [examSearchTerm, setExamSearchTerm] = useState('');
  const [examCourseFilter, setExamCourseFilter] = useState('all');
  const [examStatusFilter, setExamStatusFilter] = useState('all');
  const [examPage, setExamPage] = useState(1);
  const examsPerPage = 5;
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    course: '',
    duration: 30,
    isPublished: false,
    questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]
  });
  const safeExams = Array.isArray(exams) ? exams : [];
  const filteredExams = safeExams.filter((exam) => {
    const matchesSearch =
      !examSearchTerm ||
      exam.title?.toLowerCase().includes(examSearchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(examSearchTerm.toLowerCase());
    const matchesCourse = examCourseFilter === 'all' || exam.course === examCourseFilter;
    const matchesStatus =
      examStatusFilter === 'all' ||
      (examStatusFilter === 'published' && exam.isPublished) ||
      (examStatusFilter === 'draft' && !exam.isPublished);
    return matchesSearch && matchesCourse && matchesStatus;
  });
  const totalExamPages = Math.max(1, Math.ceil(filteredExams.length / examsPerPage));
  const paginatedExams = filteredExams.slice((examPage - 1) * examsPerPage, examPage * examsPerPage);

  // Courses State
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedChapterDetails, setSelectedChapterDetails] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '' });
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState({ title: '', textContent: '', videoUrl: '', isPublished: true });
  const [chapterFiles, setChapterFiles] = useState([]);

  const availableCourseTitles = Array.from(
    new Set(
      (Array.isArray(courses) ? courses : [])
        .map((course) => (course?.title || '').trim())
        .filter(Boolean)
    )
  );

  const examCourseOptions = Array.from(
    new Set([
      ...availableCourseTitles,
      ...safeExams.map((exam) => (exam?.course || '').trim()).filter(Boolean)
    ])
  );

  // Dummy data generators (fallback when API fails)
  const generateDummyExams = () => {
    return [
      { _id: 'dummy1', title: 'Mathematics Midterm', description: 'Comprehensive exam', course: 'mathematics', duration: 60, isPublished: true, questions: [], totalPoints: 1, createdBy: { name: 'Admin' }, createdAt: new Date().toISOString() },
      { _id: 'dummy2', title: 'English Grammar Test', description: 'Test tenses', course: 'english', duration: 45, isPublished: false, questions: [], totalPoints: 1, createdBy: { name: 'Admin' }, createdAt: new Date().toISOString() },
      { _id: 'dummy3', title: 'Biology Final Exam', description: 'Cells, genetics, and ecology', course: 'biology', duration: 50, isPublished: true, questions: [], totalPoints: 1, createdBy: { name: 'Admin' }, createdAt: new Date().toISOString() }
    ];
  };

  const generateDummyCourses = () => {
    return [
      { _id: 'course1', title: 'Mathematics', description: 'Algebra, Geometry, Calculus' },
      { _id: 'course2', title: 'English', description: 'Grammar, Literature, Writing' },
      { _id: 'course3', title: 'Biology', description: 'Cell Biology, Genetics, Ecology' }
    ];
  };

  const generateDummyChapters = (courseId) => {
    const dummyMap = {
      course1: [
        { _id: 'chap1', title: 'Introduction to Algebra', content: 'Basic algebraic concepts...', videoUrl: '', isPublished: true },
        { _id: 'chap2', title: 'Linear Equations', content: 'Solving linear equations...', videoUrl: '', isPublished: true }
      ],
      course2: [
        { _id: 'chap3', title: 'Parts of Speech', content: 'Nouns, verbs, adjectives...', videoUrl: '', isPublished: true },
        { _id: 'chap4', title: 'Tenses', content: 'Past, present, future...', videoUrl: '', isPublished: true }
      ],
      course3: [
        { _id: 'chap5', title: 'Cell Structure', content: 'Organelles and their functions...', videoUrl: '', isPublished: true },
        { _id: 'chap6', title: 'Photosynthesis', content: 'How plants make food...', videoUrl: '', isPublished: true }
      ]
    };
    return dummyMap[courseId] || [];
  };

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    fetchStats();
    fetchUsers();
    fetchExams();
    fetchCourses();
  }, []);

  // Users functions (unchanged)
  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Stats error:', err);
      toast.error('Failed to fetch dashboard stats');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await adminAPI.getUsers({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Users error:', err);
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    setUserPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (userPage > totalUserPages) {
      setUserPage(totalUserPages);
    }
  }, [userPage, totalUserPages]);

  useEffect(() => {
    setExamPage(1);
  }, [examSearchTerm, examCourseFilter, examStatusFilter]);

  useEffect(() => {
    if (examPage > totalExamPages) {
      setExamPage(totalExamPages);
    }
  }, [examPage, totalExamPages]);

  const handleApprove = async (student) => {
    if (!window.confirm('Approve this user?')) return;
    try {
      await adminAPI.approveUser(student._id);
      openStudentCard({ ...student, isApproved: true });
      toast.success('User approved');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const normalizePhotoUrl = (value) => {
    if (!value || typeof value !== 'string') return '';
    if (value.startsWith('data:')) {
      return value;
    }
    if (value.startsWith('/uploads/')) {
      return resolveMediaUrl(value);
    }
    return resolveMediaUrl(`/uploads/${value}`);
  };

  const getStudentPhotoSrc = (student) => {
    if (cardPhotoPreview) return cardPhotoPreview;
    return normalizePhotoUrl(
      student?.profilePhoto || student?.photoUrl || student?.avatar || student?.image || ''
    );
  };

  const openStudentCard = (student) => {
    setSelectedStudent(student);
    setCardPhotoPreview('');
    setShowStudentCard(true);
  };

  const closeStudentCard = () => {
    setShowStudentCard(false);
    setCardPhotoPreview('');
  };

  const handleCardPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCardPhotoPreview(reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  // Exams functions (unchanged)
  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const res = await adminAPI.getExams();
      const normalizedExams = Array.isArray(res.data)
        ? res.data.map(normalizeExam)
        : Array.isArray(res.data?.exams)
          ? res.data.exams.map(normalizeExam)
          : [];
      setExams(normalizedExams);
    } catch (err) {
      console.error('Exams error:', err);
      toast.error('Failed to fetch exams');
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  const buildExamPayload = () => {
    const normalizedQuestions = examForm.questions.map((q) => ({
      ...q,
      questionText: (q.questionText || '').trim(),
      options: (q.options || []).map((opt) => (opt || '').trim()),
      points: Number(q.points) > 0 ? Number(q.points) : 1
    }));
    const totalPoints = normalizedQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
    return {
      title: examForm.title.trim(),
      description: (examForm.description || '').trim(),
      course: examForm.course,
      duration: Number(examForm.duration),
      isPublished: !!examForm.isPublished,
      questions: normalizedQuestions,
      totalPoints
    };
  };

  const validateExamPayload = (payload) => {
    if (!payload.title) return 'Exam title is required';
    if (!payload.course) return 'Course is required';
    if (!payload.duration || payload.duration < 1) return 'Duration must be at least 1 minute';
    if (!payload.questions.length) return 'At least one question is required';

    for (let i = 0; i < payload.questions.length; i += 1) {
      const q = payload.questions[i];
      if (!q.questionText) return `Question ${i + 1} text is required`;
      if (!Array.isArray(q.options) || q.options.length !== 4) return `Question ${i + 1} must have 4 options`;
      if (q.options.some((opt) => !opt)) return `All 4 options are required for question ${i + 1}`;
      if (q.correctAnswer < 0 || q.correctAnswer > 3) return `Select a correct option for question ${i + 1}`;
      if (!q.points || q.points < 1) return `Points must be at least 1 for question ${i + 1}`;
    }
    return null;
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    const payload = buildExamPayload();
    const validationError = validateExamPayload(payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      if (editingExam) {
        await adminAPI.updateExam(editingExam._id, payload);
        toast.success('Exam updated');
      } else {
        await adminAPI.createExam(payload);
        toast.success('Exam created');
      }
      setShowExamForm(false);
      setEditingExam(null);
      resetExamForm();
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save exam');
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await adminAPI.deleteExam(id);
      toast.success('Exam deleted');
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete exam');
    }
  };

  const handleTogglePublishExam = async (exam) => {
    const nextPublishedState = !exam.isPublished;
    try {
      await adminAPI.updateExam(exam._id, { ...exam, isPublished: nextPublishedState });
      setExams((prev) =>
        prev.map((item) =>
          item._id === exam._id ? { ...item, isPublished: nextPublishedState } : item
        )
      );
      toast.success(nextPublishedState ? 'Exam published' : 'Exam moved to draft');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update publish status');
    }
  };

  const handleDuplicateExam = async (exam) => {
    const clonePayload = {
      title: `${exam.title} (Copy)`,
      description: exam.description || '',
      course: exam.course,
      duration: exam.duration,
      isPublished: false,
      questions: (exam.questions || []).map((q) => ({
        questionText: q.questionText || '',
        options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        points: Number(q.points) > 0 ? Number(q.points) : 1
      })),
      totalPoints: (exam.questions || []).reduce((sum, q) => sum + (Number(q.points) > 0 ? Number(q.points) : 1), 0)
    };

    try {
      await adminAPI.createExam(clonePayload);
      toast.success('Exam duplicated');
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to duplicate exam');
    }
  };

  const handleViewExamDetails = async (exam) => {
    try {
      const res = await adminAPI.getExam(exam._id);
      const payload = res?.data && !Array.isArray(res.data) ? res.data : exam;
      setSelectedExamDetails(normalizeExam(payload));
    } catch (err) {
      setSelectedExamDetails(normalizeExam(exam));
      toast.error(err.response?.data?.message || 'Failed to load full exam details');
    }
  };

  const handleEditExam = (exam) => {
    const normalizedQuestions =
      exam.questions && exam.questions.length > 0
        ? exam.questions.map((q) => {
            const normalizedQuestion = normalizeExamQuestion(q);
            return {
              ...normalizedQuestion,
              options: Array.isArray(normalizedQuestion.options)
                ? [...normalizedQuestion.options]
                : ['', '', '', ''],
            };
          })
        : [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }];

    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      description: exam.description || '',
      course: exam.course,
      duration: exam.duration,
      isPublished: exam.isPublished,
      questions: normalizedQuestions
    });
    setShowExamForm(true);
  };

  const resetExamForm = () => {
    setExamForm({
      title: '',
      description: '',
      course: availableCourseTitles[0] || '',
      duration: 30,
      isPublished: false,
      questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]
    });
  };

  useEffect(() => {
    if (!examForm.course && availableCourseTitles.length > 0) {
      setExamForm((prev) => ({ ...prev, course: availableCourseTitles[0] }));
    }
  }, [availableCourseTitles, examForm.course]);

  const addQuestion = () => {
    setExamForm({
      ...examForm,
      questions: [...examForm.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = [...examForm.questions];
    newQuestions.splice(index, 1);
    setExamForm({ ...examForm, questions: newQuestions });
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const newQuestions = [...examForm.questions];
    newQuestions[qIndex][field] = value;
    setExamForm({ ...examForm, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...examForm.questions];
    newQuestions[qIndex].options[optIndex] = value;
    setExamForm({ ...examForm, questions: newQuestions });
  };

  // Courses functions (with fixes)
  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await adminAPI.getCourses();
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
      toast.error('Failed to fetch courses – using dummy data');
      setCourses(generateDummyCourses());
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchChapters = async (courseId) => {
    try {
      const res = await adminAPI.getChapters(courseId);
      setChapters(res.data);
    } catch (err) {
      console.error('Failed to fetch chapters', err);
      toast.error('Failed to fetch chapters – using dummy data');
      setChapters(generateDummyChapters(courseId));
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await adminAPI.updateCourse(editingCourse._id, courseForm);
        toast.success('Course updated');
      } else {
        await adminAPI.addCourse(courseForm);
        toast.success('Course added');
      }
      setShowCourseForm(false);
      setEditingCourse(null);
      setCourseForm({ title: '', description: '' });
      fetchCourses();
    } catch (err) {
      console.error('Course operation error:', err);
      toast.error(err.response?.data?.message || 'Operation failed. Check console.');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course? All chapters will be lost.')) return;
    try {
      await adminAPI.deleteCourse(id);
      toast.success('Course deleted');
      if (selectedCourse?._id === id) {
        setSelectedCourse(null);
        setChapters([]);
      }
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({ title: course.title, description: course.description || '' });
    setShowCourseForm(true);
  };

  const handleChapterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const chapterData = {
        title: chapterForm.title,
        textContent: chapterForm.textContent,
        videoUrl: chapterForm.videoUrl,
        isPublished: !!chapterForm.isPublished
      };

      if (editingChapter) {
        await adminAPI.updateChapter(editingChapter._id, chapterData);
        if (chapterFiles.length > 0) {
          await adminAPI.uploadChapterFiles(editingChapter._id, chapterFiles);
          toast.success('Chapter updated and files uploaded');
        } else {
          toast.success('Chapter updated');
        }
      } else {
        const res = await adminAPI.addChapter(selectedCourse._id, chapterData);
        const newChapter = res.data;
        if (chapterFiles.length > 0) {
          await adminAPI.uploadChapterFiles(newChapter._id, chapterFiles);
          toast.success('Chapter created and files uploaded');
        } else {
          toast.success('Chapter created');
        }
      }
      setShowChapterForm(false);
      setEditingChapter(null);
      resetChapterForm();
      fetchChapters(selectedCourse._id);
    } catch (err) {
      console.error('Chapter operation error:', err);
      toast.error(err.response?.data?.message || 'Operation failed. Check console.');
    }
  };

  // ✅ FIXED DELETE CHAPTER WITH DETAILED ERROR HANDLING
  const handleDeleteChapter = async (id) => {
    if (!window.confirm('Delete this chapter?')) return;
    try {
      console.log('Deleting chapter with ID:', id); // Debug: check ID
      const response = await adminAPI.deleteChapter(id);
      console.log('Delete response:', response);
      toast.success('Chapter deleted');
      fetchChapters(selectedCourse._id);
    } catch (err) {
      console.error('Delete chapter error:', err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        toast.error(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown'}`);
      } else if (err.request) {
        toast.error('Network error - no response from server');
      } else {
        toast.error('Error: ' + err.message);
      }
    }
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setChapterForm({
      title: chapter.title,
      textContent: chapter.content || chapter.textContent || '',
      videoUrl: chapter.videoUrl || '',
      isPublished: chapter.isPublished !== false
    });
    setChapterFiles([]);
    setShowChapterForm(true);
  };

  const resetChapterForm = () => {
    setChapterForm({ title: '', textContent: '', videoUrl: '', isPublished: true });
    setChapterFiles([]);
  };

  const handleTogglePublishChapter = async (chapter) => {
    try {
      const nextPublishedState = !chapter.isPublished;
      const res = await adminAPI.updateChapter(chapter._id, {
        title: chapter.title,
        textContent: chapter.textContent || chapter.content || '',
        videoUrl: chapter.videoUrl || '',
        isPublished: nextPublishedState
      });
      const updatedChapter = res.data;
      setChapters((prev) => prev.map((item) => (
        item._id === chapter._id ? updatedChapter : item
      )));
      setSelectedChapterDetails((prev) => (
        prev && prev._id === chapter._id ? updatedChapter : prev
      ));
      toast.success(nextPublishedState ? 'Chapter published' : 'Chapter unpublished');
    } catch (err) {
      console.error('Toggle chapter publish error:', err);
      toast.error(err.response?.data?.message || 'Failed to update chapter publish status');
    }
  };

  const handleFileChange = (e) => {
    setChapterFiles([...e.target.files]);
  };

  const removeFile = (index) => {
    setChapterFiles(chapterFiles.filter((_, i) => i !== index));
  };

  const handleDeleteChapterFile = async (chapterId, filename) => {
    if (!chapterId || !filename) return;
    if (!window.confirm('Delete this uploaded file?')) return;

    try {
      const res = await adminAPI.deleteChapterFile(chapterId, filename);
      const updatedChapter = res.data?.chapter;

      if (updatedChapter) {
        setSelectedChapterDetails(updatedChapter);
        setChapters((prev) => prev.map((chapter) => (
          chapter._id === updatedChapter._id ? updatedChapter : chapter
        )));
      }

      toast.success('File deleted');
    } catch (err) {
      console.error('Delete chapter file error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const isVideoFile = (file) => (file?.mimetype || '').startsWith('video/');
  const isPdfFile = (file) => (file?.mimetype || '').includes('pdf');
  const isImageFile = (file) => (file?.mimetype || '').startsWith('image/');
  const isDocumentFile = (file) => {
    const name = (file?.originalName || '').toLowerCase();
    const mime = (file?.mimetype || '').toLowerCase();
    const docExt = ['.doc', '.docx', '.txt', '.ppt', '.pptx'];
    return docExt.some((ext) => name.endsWith(ext)) ||
      mime.includes('msword') ||
      mime.includes('officedocument') ||
      mime.includes('presentation') ||
      mime.includes('text/plain');
  };

  const getDocumentViewUrl = (file) => {
    const name = (file?.originalName || '').toLowerCase();
    const isOfficeDoc = ['.doc', '.docx', '.ppt', '.pptx'].some((ext) => name.endsWith(ext));
    const url = resolveMediaUrl(file?.url || '');

    if (isOfficeDoc && /^https:\/\//.test(url)) {
      try {
        new URL(url);
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
      } catch (err) {
        return url;
      }
    }
    return url || '#';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleLanguageChange = () => {
    cycleLanguage();
  };

  const getQrCodeUrl = (student) => {
    if (!student?._id) return '';
    const qrPayload = JSON.stringify({
      id: student._id,
      name: student.name || '',
      sex: student.sex || '',
      age: student.age || '',
      grade: student.grade || '',
      phoneNumber: student.phoneNumber || ''
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrPayload)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.adminDashboard}</h1>
            <p className="text-sm text-gray-600">{t.managePlatform}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleLanguageChange}
              className="text-sm bg-blue-600 text-white border border-blue-600 rounded-md px-3 py-1 inline-flex items-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <span>{activeLanguage.flag}</span>
              <span>{t.changeLanguage}: {activeLanguage.label}</span>
            </button>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{t.administrator}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600">
              <FaSignOutAlt className="mr-2" /> {t.logout}
            </button>
          </div>
        </div>
      </header>

      {stats && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm text-gray-500">{t.totalUsers}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaUserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm text-gray-500">{t.approved}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approvedUsers || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm text-gray-500">{t.pending}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingUsers || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaChartLine className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm text-gray-500">{t.exams}</p>
                <p className="text-2xl font-semibold text-gray-900">{exams.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaUsers className="inline mr-2" /> {t.userManagement}
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'exams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaFileAlt className="inline mr-2" /> {t.examManagement}
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaBook className="inline mr-2" /> {t.courseManagement}
          </button>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                  <p className="text-sm text-gray-600">Approve / reject user accounts</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingUsers ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center">Loading...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No users found</td></tr>
                  ) : (
                    paginatedUsers.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="font-bold text-blue-800">{u.name?.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{u.name}</div>
                              <div className="text-sm text-gray-500">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <span className="text-gray-400 mr-2">📧</span> {u.email}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-gray-400 mr-2">📞</span> {u.phoneNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {u.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!u.isApproved && (
                              <button
                                onClick={() => handleApprove(u)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <FaUserCheck />
                              </button>
                            )}
                            {u.isApproved && (
                              <button
                                onClick={() => {
                                  openStudentCard(u);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Student ID"
                              >
                                <FaEye />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loadingUsers && users.length > usersPerPage && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {userPage} of {totalUserPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                    disabled={userPage === 1}
                    className=" bg-green-400 px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button   
                    type="button"
                    onClick={() => setUserPage((prev) => Math.min(totalUserPages, prev + 1))}
                    disabled={userPage === totalUserPages}
                    className="bg-blue-400 px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'exams' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Exam Management</h2>
              <button
                onClick={() => {
                  if (availableCourseTitles.length === 0) {
                    toast.error('Create a course first, then create an exam.');
                    setActiveTab('courses');
                    return;
                  }
                  setEditingExam(null);
                  resetExamForm();
                  setShowExamForm(true);
                }}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <FaPlus className="mr-2" /> Create New Exam
              </button>
            </div>

            {showExamForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingExam ? 'Edit Exam' : 'Create New Exam'}
                    </h3>
                    <button onClick={() => setShowExamForm(false)} className="text-gray-400 hover:text-gray-600">
                      <FaTimes />
                    </button>
                  </div>
                  <form onSubmit={handleExamSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title *</label>
                        <input
                          type="text"
                          value={examForm.title}
                          onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                        <select
                          value={examForm.course}
                          onChange={(e) => setExamForm({ ...examForm, course: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {examCourseOptions.length === 0 ? (
                            <option value="">No courses available</option>
                          ) : (
                            examCourseOptions.map((courseTitle) => (
                              <option key={courseTitle} value={courseTitle}>
                                {courseTitle}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                        <input
                          type="number"
                          value={examForm.duration}
                          onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="1"
                          required
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={examForm.isPublished}
                            onChange={(e) => setExamForm({ ...examForm, isPublished: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Publish immediately</span>
                        </label>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={examForm.description}
                        onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Questions</label>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                        >
                          <FaPlus className="mr-1" /> Add Question
                        </button>
                      </div>
                      {examForm.questions.map((q, qIndex) => (
                        <div key={qIndex} className="border rounded-lg p-4 mb-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-700">Question {qIndex + 1}</h4>
                            {examForm.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                          <div className="mb-3">
                            <label className="block text-xs text-gray-600 mb-1">Question Text *</label>
                            <input
                              type="text"
                              value={q.questionText}
                              onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="block text-xs text-gray-600 mb-1">Options *</label>
                            {q.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center mb-2">
                                <span className="w-6 text-gray-500">{String.fromCharCode(65 + optIndex)}.</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder={`Option ${optIndex + 1}`}
                                  required
                                />
                                <div className="ml-2 flex items-center">
                                  <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={q.correctAnswer === optIndex}
                                    onChange={() => handleQuestionChange(qIndex, 'correctAnswer', optIndex)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="ml-1 text-xs text-gray-600">Correct</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Points</label>
                            <input
                              type="number"
                              value={q.points}
                              onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 1)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              min="1"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowExamForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {editingExam ? 'Update Exam' : 'Create Exam'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">All Exams</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Search exams..."
                      value={examSearchTerm}
                      onChange={(e) => setExamSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <select
                      value={examCourseFilter}
                      onChange={(e) => setExamCourseFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All courses</option>
                      {examCourseOptions.map((courseTitle) => (
                        <option key={courseTitle} value={courseTitle}>
                          {courseTitle}
                        </option>
                      ))}
                    </select>
                    <select
                      value={examStatusFilter}
                      onChange={(e) => setExamStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>
              {loadingExams ? (
                <div className="p-12 text-center">Loading exams...</div>
              ) : exams.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No exams created yet.</div>
              ) : filteredExams.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No exams match your filters.</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {paginatedExams.map((exam) => (
                    <div key={exam._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">{exam.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              exam.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {exam.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center"><FaBook className="mr-1" /> {exam.course}</span>
                            <span className="flex items-center"><FaHourglassHalf className="mr-1" /> {exam.duration} min</span>
                            <span className="flex items-center"><FaQuestionCircle className="mr-1" /> {exam.questions?.length || 0} questions</span>
                            <span className="flex items-center">📊 {exam.totalPoints} points</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Created by {exam.createdBy?.name || 'Admin'} on {new Date(exam.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleTogglePublishExam(exam)}
                            className={`text-xs px-2 py-1 rounded ${
                              exam.isPublished ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                            title={exam.isPublished ? 'Move to draft' : 'Publish exam'}
                          >
                            {exam.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleEditExam(exam)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleViewExamDetails(exam)}
                            className="text-slate-600 hover:text-slate-800 p-1"
                            title="View Questions"
                          >
                            <FaQuestionCircle />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/student/exams/${exam._id}`, {
                                state: { previewExam: exam, previewMode: true }
                              })
                            }
                            className="text-emerald-600 hover:text-emerald-800 p-1"
                            title="Preview"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDuplicateExam(exam)}
                            className="text-indigo-600 hover:text-indigo-800 p-1"
                            title="Duplicate"
                          >
                            <FaCopy />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {filteredExams.length > examsPerPage && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Page {examPage} of {totalExamPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExamPage((prev) => Math.max(1, prev - 1))}
                      disabled={examPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamPage((prev) => Math.min(totalExamPages, prev + 1))}
                      disabled={examPage === totalExamPages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Course Management</h2>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setCourseForm({ title: '', description: '' });
                  setShowCourseForm(true);
                }}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <FaPlus className="mr-2" /> Add New Course
              </button>
            </div>

            {/* Course Form Modal */}
            {showCourseForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingCourse ? 'Edit Course' : 'Add New Course'}
                    </h3>
                    <button onClick={() => setShowCourseForm(false)} className="text-gray-400 hover:text-gray-600">
                      <FaTimes />
                    </button>
                  </div>
                  <form onSubmit={handleCourseSubmit} className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                      <input
                        type="text"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCourseForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {editingCourse ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course List */}
              <div className="bg-white rounded-lg shadow overflow-hidden md:col-span-1">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">All Courses</h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {loadingCourses ? (
                    <div className="p-4 text-center">Loading...</div>
                  ) : courses.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No courses yet.</div>
                  ) : (
                    courses.map((course) => (
                      <div
                        key={course._id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedCourse?._id === course._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                        onClick={() => {
                          setSelectedCourse(course);
                          fetchChapters(course._id);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{course.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditCourse(course); }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course._id); }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chapters for selected course */}
              <div className="bg-white rounded-lg shadow overflow-hidden md:col-span-2">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCourse ? `Chapters: ${selectedCourse.title}` : 'Select a course'}
                  </h3>
                  {selectedCourse && (
                    <button
                      onClick={() => {
                        setEditingChapter(null);
                        resetChapterForm();
                        setShowChapterForm(true);
                      }}
                      className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      <FaPlus className="mr-1" /> Add Chapter
                    </button>
                  )}
                </div>

                {/* Chapter Form Modal */}
                {showChapterForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                        </h3>
                        <button onClick={() => setShowChapterForm(false)} className="text-gray-400 hover:text-gray-600">
                          <FaTimes />
                        </button>
                      </div>
                      <form onSubmit={handleChapterSubmit} className="p-6">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title *</label>
                          <input
                            type="text"
                            value={chapterForm.title}
                            onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
                          <input
                            type="url"
                            value={chapterForm.videoUrl}
                            onChange={(e) => setChapterForm({ ...chapterForm, videoUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Text Notes</label>
                          <textarea
                            value={chapterForm.textContent}
                            onChange={(e) => setChapterForm({ ...chapterForm, textContent: e.target.value })}
                            rows="5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={!!chapterForm.isPublished}
                              onChange={(e) => setChapterForm({ ...chapterForm, isPublished: e.target.checked })}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            Publish this chapter for users
                          </label>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files (PDF, DOC, TXT, PPT, Images, Videos)</label>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.webm"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        {chapterFiles.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Selected files:</h4>
                            <ul className="space-y-2">
                              {chapterFiles.map((file, idx) => (
                                <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <div className="flex items-center space-x-2">
                                    {file.type.includes('pdf') && <FaFilePdf className="text-red-600" />}
                                    {file.type.includes('presentation') && <FaFilePowerpoint className="text-orange-600" />}
                                    {(file.type.includes('msword') || file.type.includes('officedocument') || file.type.includes('text/plain')) && (
                                      <FaFileWord className="text-blue-700" />
                                    )}
                                    {file.type.includes('image') && <FaImage className="text-blue-600" />}
                                    {file.type.includes('video') && <FaVideo className="text-purple-600" />}
                                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                                  </div>
                                  <button type="button" onClick={() => removeFile(idx)} className="text-red-600 hover:text-red-800">
                                    <FaTrash size={14} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setShowChapterForm(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            {editingChapter ? 'Update Chapter' : 'Add Chapter'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-gray-200">
                  {!selectedCourse ? (
                    <div className="p-8 text-center text-gray-500">Please select a course from the left.</div>
                  ) : chapters.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No chapters yet. Click "Add Chapter".</div>
                  ) : (
                    chapters.map((chapter) => (
                      <div key={chapter._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-medium text-gray-900">{chapter.title}</h4>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  chapter.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {chapter.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            {chapter.videoUrl && (
                              <div className="mt-1 text-sm text-blue-600">
                                <a href={chapter.videoUrl} target="_blank" rel="noopener noreferrer">Video Link</a>
                              </div>
                            )}
                            {chapter.content && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{chapter.content}</p>
                            )}
                            {chapter.textContent && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{chapter.textContent}</p>
                            )}
                            {!!chapter.files?.length && (
                              <p className="text-xs text-gray-500 mt-2">
                                {chapter.files.length} uploaded file{chapter.files.length > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => setSelectedChapterDetails(chapter)}
                              className="text-indigo-600 hover:text-indigo-800"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEditChapter(chapter)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleTogglePublishChapter(chapter)}
                              className={chapter.isPublished ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                              title={chapter.isPublished ? 'Unpublish chapter' : 'Publish chapter'}
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(chapter._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedExamDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedExamDetails.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedExamDetails.questions?.length || 0} questions
                  </p>
                </div>
                <button
                  onClick={() => setSelectedExamDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {selectedExamDetails.description ? (
                  <p className="text-sm text-gray-600">{selectedExamDetails.description}</p>
                ) : null}

                {!selectedExamDetails.questions?.length ? (
                  <div className="text-gray-500">No questions added yet.</div>
                ) : (
                  selectedExamDetails.questions.map((question, index) => (
                    <div key={`${selectedExamDetails._id}-${index}`} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-semibold text-gray-900">
                          Question {index + 1}
                        </h4>
                        <span className="text-xs font-medium text-gray-500">
                          {Number(question?.points) > 0 ? Number(question.points) : 1} point(s)
                        </span>
                      </div>

                      <p className="mt-2 text-gray-800 whitespace-pre-line">
                        {question?.questionText || question?.question || 'No question text provided.'}
                      </p>

                      <div className="mt-4 space-y-2">
                        {(Array.isArray(question?.options) ? question.options : []).map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`rounded border px-3 py-2 text-sm ${
                              question?.correctAnswer === optionIndex
                                ? 'border-green-300 bg-green-50 text-green-800'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + optionIndex)}.</span>
                            <span>{option || `Option ${optionIndex + 1}`}</span>
                            {question?.correctAnswer === optionIndex ? (
                              <span className="ml-2 text-xs font-semibold">Correct</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {selectedChapterDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{selectedChapterDetails.title}</h3>
                <button
                  onClick={() => setSelectedChapterDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      selectedChapterDetails.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedChapterDetails.isPublished ? 'Published for users' : 'Hidden from users'}
                  </span>
                </div>
                {(selectedChapterDetails.textContent || selectedChapterDetails.content) ? (
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedChapterDetails.textContent || selectedChapterDetails.content}
                  </p>
                ) : (
                  <p className="text-gray-500">No chapter notes.</p>
                )}

                {selectedChapterDetails.videoUrl && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-2">Chapter Video Link</h4>
                    <a
                      href={selectedChapterDetails.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Open video URL
                    </a>
                  </div>
                )}

                {!!selectedChapterDetails.files?.length && (
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-gray-800">Uploaded Files</h4>

                    {selectedChapterDetails.files.filter(isVideoFile).length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Videos</p>
                        {selectedChapterDetails.files.filter(isVideoFile).map((file) => (
                          <div key={file.filename} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700">{file.originalName}</p>
                              <button
                                type="button"
                                onClick={() => handleDeleteChapterFile(selectedChapterDetails._id, file.filename)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete file"
                              >
                                <FaTrash />
                              </button>
                            </div>
                            <video controls className="w-full rounded bg-black">
                              <source src={file.url} type={file.mimetype || 'video/mp4'} />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedChapterDetails.files.filter(isPdfFile).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">PDFs</p>
                        {selectedChapterDetails.files.filter(isPdfFile).map((file) => (
                          <div key={file.filename} className="flex items-center justify-between">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-red-600 hover:text-red-700"
                            >
                              <FaFilePdf className="mr-2" />
                              {file.originalName}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteChapterFile(selectedChapterDetails._id, file.filename)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete file"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedChapterDetails.files.filter((file) => !isVideoFile(file) && !isPdfFile(file) && isDocumentFile(file)).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Documents</p>
                        {selectedChapterDetails.files
                          .filter((file) => !isVideoFile(file) && !isPdfFile(file) && !isImageFile(file) && isDocumentFile(file))
                          .map((file) => (
                            <div key={file.filename} className="flex items-center justify-between">
                              <a
                                href={getDocumentViewUrl(file)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-700"
                              >
                                <FaFileAlt className="mr-2" />
                                {file.originalName}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteChapterFile(selectedChapterDetails._id, file.filename)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete file"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}

                    {selectedChapterDetails.files.filter(isImageFile).length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Images</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {selectedChapterDetails.files.filter(isImageFile).map((file) => (
                            <div key={file.filename} className="block border rounded p-2">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block hover:border-blue-300"
                              >
                                <img src={file.url} alt={file.originalName} className="w-full h-36 object-cover rounded mb-2" />
                                <p className="text-sm text-gray-700 truncate">{file.originalName}</p>
                              </a>
                              <div className="mt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteChapterFile(selectedChapterDetails._id, file.filename)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete file"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedChapterDetails.files.filter((file) => !isVideoFile(file) && !isPdfFile(file) && !isImageFile(file) && !isDocumentFile(file)).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Other Files</p>
                        {selectedChapterDetails.files
                          .filter((file) => !isVideoFile(file) && !isPdfFile(file) && !isImageFile(file) && !isDocumentFile(file))
                          .map((file) => (
                            <div key={file.filename} className="flex items-center justify-between">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-700"
                              >
                                <FaFileAlt className="mr-2" />
                                {file.originalName}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteChapterFile(selectedChapterDetails._id, file.filename)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete file"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {!selectedChapterDetails.files?.length && (
                  <p className="text-gray-500">No uploaded files for this chapter.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {showStudentCard && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">NDS School</h3>
                <button
                  onClick={closeStudentCard}
                  className="text-white/80 hover:text-white text-lg"
                  title="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-5 bg-gradient-to-b from-blue-50 to-white">
                <div className="border-2 border-blue-800 rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-4">
                    {getStudentPhotoSrc(selectedStudent) ? (
                      <img
                        src={getStudentPhotoSrc(selectedStudent)}
                        alt="Student profile"
                        className="h-24 w-24 rounded-md border border-blue-200 object-cover"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-md border border-blue-200 bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-800">
                        {selectedStudent.name?.charAt(0) || 'S'}
                      </div>
                    )}
                    <img
                      src={getQrCodeUrl(selectedStudent)}
                      alt="Student QR code"
                      className="h-24 w-24 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-gray-900">
                    <p><span className="font-bold">NAME:</span> {selectedStudent.name || 'N/A'}</p>
                    <p><span className="font-bold">SEX:</span> {selectedStudent.sex || 'N/A'}</p>
                    <p><span className="font-bold">AGE:</span> {selectedStudent.age || 'N/A'}</p>
                    <p><span className="font-bold">GRADE:</span> {selectedStudent.grade || 'N/A'}</p>
                    <p><span className="font-bold">PHONE:</span> {selectedStudent.phoneNumber || 'N/A'}</p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Photo (for ID card)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCardPhotoChange}
                      className="block w-full text-xs text-gray-600"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Print Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaFileAlt, FaFilePdf, FaImage, FaPlay, FaVideo } from 'react-icons/fa';
import { resolveMediaUrl, studentAPI } from '../services/api';

const getFileName = (file) => (file?.originalName || file?.filename || file?.url || '').toLowerCase();
const hasExtension = (file, extensions) => extensions.some((ext) => getFileName(file).endsWith(ext));

const isVideoFile = (file) => {
  const mime = (file?.mimetype || '').toLowerCase();
  return mime.startsWith('video/') || hasExtension(file, ['.mp4', '.mov', '.webm', '.m4v', '.avi', '.mkv']);
};

const isPdfFile = (file) => {
  const mime = (file?.mimetype || '').toLowerCase();
  return mime.includes('pdf') || hasExtension(file, ['.pdf']);
};

const isImageFile = (file) => {
  const mime = (file?.mimetype || '').toLowerCase();
  return mime.startsWith('image/') || hasExtension(file, ['.jpg', '.jpeg', '.png', '.gif', '.webp']);
};

const isDocumentFile = (file) => {
  const name = getFileName(file);
  const mime = (file?.mimetype || '').toLowerCase();
  const docExt = ['.doc', '.docx', '.txt', '.ppt', '.pptx'];
  return docExt.some((ext) => name.endsWith(ext)) ||
    mime.includes('msword') ||
    mime.includes('officedocument') ||
    mime.includes('presentation') ||
    mime.includes('text/plain');
};

const isDirectVideoUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  return /\.(mp4|mov|webm|m4v|avi|mkv)(\?.*)?$/i.test(value) || /^blob:|^data:video\//i.test(value);
};

const getEmbeddedVideoUrl = (value) => {
  if (!value || typeof value !== 'string') return '';

  try {
    const url = new URL(value, window.location.origin);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = url.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (host === 'youtu.be') {
      const videoId = url.pathname.replace(/\//g, '');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (host === 'vimeo.com') {
      const videoId = url.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    }
  } catch (err) {
    return '';
  }

  return '';
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

const normalizeChapter = (chapter) => {
  if (!chapter || typeof chapter !== 'object') return chapter;

  return {
    ...chapter,
    videoUrl: resolveMediaUrl(chapter.videoUrl || ''),
    files: Array.isArray(chapter.files)
      ? chapter.files.map((file) => ({
          ...file,
          url: resolveMediaUrl(file?.url || ''),
        }))
      : [],
  };
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseChapters = async () => {
      try {
        setLoading(true);
        const res = await studentAPI.getCourseChapters(courseId);
        const foundCourse = res.data?.course || null;
        const foundChapters = Array.isArray(res.data?.chapters)
          ? res.data.chapters.map(normalizeChapter)
          : [];
        setCourse(foundCourse);
        setChapters(foundChapters);
        setSelectedChapter(foundChapters[0] || null);
      } catch (err) {
        console.error('Failed to fetch chapters', err);
        setCourse(null);
        setChapters([]);
        setSelectedChapter(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseChapters();
  }, [courseId]);

  const selectedChapterVideos = useMemo(() => {
    if (!selectedChapter?.files?.length) return [];
    return selectedChapter.files.filter(isVideoFile);
  }, [selectedChapter]);

  const selectedChapterPdfs = useMemo(() => {
    if (!selectedChapter?.files?.length) return [];
    return selectedChapter.files.filter(isPdfFile);
  }, [selectedChapter]);

  const selectedChapterDocuments = useMemo(() => {
    if (!selectedChapter?.files?.length) return [];
    return selectedChapter.files.filter((file) => !isVideoFile(file) && !isPdfFile(file) && !isImageFile(file) && isDocumentFile(file));
  }, [selectedChapter]);

  const selectedChapterImages = useMemo(() => {
    if (!selectedChapter?.files?.length) return [];
    return selectedChapter.files.filter(isImageFile);
  }, [selectedChapter]);

  const selectedChapterOtherFiles = useMemo(() => {
    if (!selectedChapter?.files?.length) return [];
    return selectedChapter.files.filter((file) => !isVideoFile(file) && !isPdfFile(file) && !isImageFile(file) && !isDocumentFile(file));
  }, [selectedChapter]);

  const embeddedVideoUrl = useMemo(
    () => getEmbeddedVideoUrl(selectedChapter?.videoUrl || ''),
    [selectedChapter]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/courses" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <FaArrowLeft className="mr-2" /> Back to Courses
          </Link>
          <div className="bg-white rounded-xl shadow p-8 text-gray-600">Course not found or not published.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <Link to="/courses" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <FaArrowLeft className="mr-2" /> Back to Courses
        </Link>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-8">{course.description || 'No description provided.'}</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {selectedChapter ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">{selectedChapter.title}</h2>
                  {(selectedChapter.textContent || selectedChapter.content) ? (
                    <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                      {selectedChapter.textContent || selectedChapter.content}
                    </div>
                  ) : (
                    <p className="text-gray-500">No chapter notes.</p>
                  )}
                </div>

                {selectedChapter.videoUrl && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <FaVideo className="mr-2 text-blue-600" /> Chapter Video
                    </h3>
                    {isDirectVideoUrl(selectedChapter.videoUrl) ? (
                      <video controls className="w-full rounded bg-black">
                        <source src={selectedChapter.videoUrl} />
                        Your browser does not support the video tag.
                      </video>
                    ) : embeddedVideoUrl ? (
                      <div className="aspect-video overflow-hidden rounded bg-black">
                        <iframe
                          src={embeddedVideoUrl}
                          title={selectedChapter.title || 'Chapter video'}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={selectedChapter.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex text-sm text-blue-600 hover:text-blue-800"
                      >
                        Open video
                      </a>
                    )}
                  </div>
                )}

                {selectedChapterVideos.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Video Files</h3>
                    <div className="space-y-4">
                      {selectedChapterVideos.map((file) => (
                        <div key={file.filename} className="border rounded p-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">{file.originalName}</p>
                          <video controls className="w-full rounded bg-black">
                            <source src={file.url} type={file.mimetype || 'video/mp4'} />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedChapterPdfs.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Uploaded PDF Files</h3>
                    <div className="space-y-2">
                      {selectedChapterPdfs.map((file) => (
                        <div key={file.filename} className="flex items-center justify-between border rounded px-3 py-2">
                          <span className="flex items-center text-gray-800">
                            <FaFilePdf className="mr-2 text-red-600" />
                            {file.originalName}
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              View
                            </a>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedChapterDocuments.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Documents</h3>
                    <div className="space-y-2">
                      {selectedChapterDocuments.map((file) => (
                        <div key={file.filename} className="flex items-center justify-between border rounded px-3 py-2">
                          <span className="flex items-center text-gray-800">
                            <FaFileAlt className="mr-2 text-blue-600" />
                            {file.originalName}
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={getDocumentViewUrl(file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              View
                            </a>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedChapterImages.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Images</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {selectedChapterImages.map((file) => (
                        <div key={file.filename} className="block border rounded p-2">
                          <img
                            src={file.url}
                            alt={file.originalName}
                            className="w-full h-40 object-cover rounded mb-2"
                          />
                          <p className="text-sm text-gray-700 truncate mb-2">{file.originalName}</p>
                          <div className="flex items-center gap-2">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              View
                            </a>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedChapterOtherFiles.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Other Files</h3>
                    <div className="space-y-2">
                      {selectedChapterOtherFiles.map((file) => (
                        <div key={file.filename} className="flex items-center justify-between border rounded px-3 py-2">
                          <span className="flex items-center text-gray-800">
                            <FaFileAlt className="mr-2 text-blue-600" />
                            {file.originalName}
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              View
                            </a>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-6 text-gray-600">No uploaded chapters for this course yet.</div>
            )}
          </div>

          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Uploaded Chapters</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {chapters.length === 0 ? (
                <p className="text-sm text-gray-500">No chapters uploaded yet.</p>
              ) : (
                chapters.map((chapter, index) => (
                  <button
                    key={chapter._id}
                    onClick={() => setSelectedChapter(chapter)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedChapter?._id === chapter._id
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <FaPlay className={`mr-2 text-sm ${selectedChapter?._id === chapter._id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-gray-800">{chapter.title}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaFileAlt className="mr-1" /> Chapter {index + 1}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

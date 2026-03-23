import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaGraduationCap, FaUsers, FaRocket } from 'react-icons/fa';
import img1 from '../assets/home1.jpg';
import img2 from '../assets/home2.jpg';
import img3 from '../assets/home3.jpg';

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [img1, img2, img3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero with auto‑animation */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>
          ))}
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              NDS Trading Opportunity Hub Partnership
            </h1>
            <p className="text-xl mb-8">
              Empowering Ethiopia's Future through Education and Innovation
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 inline-flex items-center">
                Get Started <FaPlay className="ml-2" />
              </Link>
              <Link to="/courses" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600">
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-4xl font-bold text-blue-800 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To create talented, energetic, visionary and well‑organised social media 
                and financial influencers in Ethiopia who will drive innovation and 
                economic growth in the digital era.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Giving sustainable, renewable and versatile opportunities to everyone 
                through quality education, mentorship, and career development programs 
                tailored for the Ethiopian market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose NDS?</h2>
            <p className="text-xl text-gray-600">Comprehensive learning experience designed for success</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <FaGraduationCap className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Quality Education</h3>
              <p className="text-gray-600">Expert-led courses designed for Ethiopian students</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <FaUsers className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Community</h3>
              <p className="text-gray-600">Join a network of ambitious learners</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <FaRocket className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Career Growth</h3>
              <p className="text-gray-600">Skills that open doors to opportunities</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Our Services</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
          We provide high‑quality online courses in Mathematics, English, Biology, Physics, and Chemistry.
        </p>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-2xl p-12 text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Start Your Learning Journey Today</h2>
          <p className="text-xl mb-8">
            Join thousands of students already transforming their futures with NDS Education.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Register Now <span className="ml-2">➔</span>
          </Link>
          <p className="mt-4 text-blue-200">
            Click the button above to open the registration page and create your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Services;
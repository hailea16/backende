import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaVenusMars, FaBirthdayCake, FaGraduationCap,
  FaPhone, FaLock, FaEye, FaEyeSlash, FaEnvelope,
  FaCheckCircle
} from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sex: 'Male',
    age: '',
    grade: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [tempUserId, setTempUserId] = useState(null);

  const grades = [
    '9th Grade', '10th Grade', '11th Grade', '12th Grade',
    '1st Year College', '2nd Year College', '3rd Year College', '4th Year College',
    'Graduate', 'Working Professional', 'Other'
  ];

  const safeFetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    const text = await res.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    try {
      return { ok: res.ok, status: res.status, data: JSON.parse(text) };
    } catch (e) {
      console.error('Invalid JSON:', text);
      throw new Error('Server returned invalid JSON');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.age) newErrors.age = 'Age is required';
    else if (isNaN(formData.age)) newErrors.age = 'Age must be a number';
    else if (formData.age < 13 || formData.age > 100)
      newErrors.age = 'Age must be between 13 and 100';

    if (!formData.grade) newErrors.grade = 'Educational level is required';
    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = 'Enter a valid phone number (10-15 digits)';

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email))
      newErrors.email = 'Enter a valid email address';

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3)
      newErrors.username = 'Username must be at least 3 characters';
    else if (!usernameRegex.test(formData.username))
      newErrors.username =
        'Username can only contain letters, numbers, and underscores';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { ok, data } = await safeFetchJson('/api/auth/register-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sex: formData.sex,
          age: parseInt(formData.age),
          grade: formData.grade,
          phoneNumber: formData.phone,
          email: formData.email,
          username: formData.username,
          password: formData.password
        })
      });

      if (!ok) throw new Error(data.message || 'Registration failed');

      setTempUserId(data.userId);
      setVerificationStep(true);
      alert(`Verification code sent to ${formData.email}. Please check your inbox.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!userEnteredCode) {
      alert('Please enter verification code');
      return;
    }

    setIsLoading(true);
    try {
      const { ok, data } = await safeFetchJson('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tempUserId,
          code: userEnteredCode
        })
      });

      if (!ok) throw new Error(data.message || 'Verification failed');

      setRegistrationSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const AdminApprovalStatus = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-3xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600">Your account is pending admin approval</p>
        </div>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <FaCheckCircle className="text-green-600 text-xl" />
              <div>
                <h3 className="font-semibold text-green-800">Email Verified ✓</h3>
                <p className="text-green-700 text-sm mt-1">
                  Your account is waiting for admin approval.
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            >
              Go to Home
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (registrationSuccess) return <AdminApprovalStatus />;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - info */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Join <span className="text-blue-600">NDS Education</span>
            </h1>
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">1</div>
                <div>
                  <p className="font-medium text-gray-800">Fill Registration Form</p>
                  <p className="text-sm text-gray-600">Enter your personal details</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">2</div>
                <div>
                  <p className="font-medium text-gray-800">Email Verification</p>
                  <p className="text-sm text-gray-600">Check your email for the code</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">3</div>
                <div>
                  <p className="font-medium text-gray-800">Admin Approval</p>
                  <p className="text-sm text-gray-600">Account activated after admin review</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {!verificationStep ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                        min=""
                        max=""
                      />
                      {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                    </div>

                    {/* Educational Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Educational Level *</label>
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select level</option>
                        {grades.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+251..."
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                      />
                      {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="******"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="******"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="terms"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Register'}
                  </button>

                  <p className="text-center text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              </>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify Your Email</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    A verification code has been sent to <strong>{formData.email}</strong>
                  </p>
                  <p className="text-sm text-blue-700 mt-1">.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={userEnteredCode}
                    onChange={(e) => setUserEnteredCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleVerifyAndRegister}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Register'}
                  </button>
                  <button
                    onClick={() => setVerificationStep(false)}
                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
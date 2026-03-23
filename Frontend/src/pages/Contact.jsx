import React, { useState } from 'react';
import { FaWhatsapp, FaTelegram, FaUser, FaPaperPlane, FaLock, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { contactAPI } from '../services/api';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    username: '',
    message: '',
    password: '',
    whatsapp: '',
    telegram: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.message || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await contactAPI.submit(formData);
      toast.success('Message sent successfully! We will contact you soon.');
      setFormData({ username: '', message: '', password: '', whatsapp: '', telegram: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: <FaWhatsapp />, title: "WhatsApp", value: "+251-944770488", color: "from-green-500 to-emerald-500", link: "https://wa.me/251944770488" },
    { icon: <FaTelegram />, title: "Telegram", value: "@NDS_Trading_Hub", color: "from-blue-500 to-cyan-500", link: "https://t.me/NDS_Trading_Hub" },
    { icon: <FaPhone />, title: "Phone", value: "+251-944770488", color: "from-purple-500 to-pink-500", link: "tel:+251944770488" },
    { icon: <FaMapMarkerAlt />, title: "Location", value: "JIGJIGA, Ethiopia", color: "from-orange-500 to-red-500", link: "#" }
  ];

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Contact <span className="text-blue-600">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team. We're here to help you with any questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              <div className="space-y-4">
                {contactInfo.map((info, idx) => (
                  <a key={idx} href={info.link} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="flex items-center p-4 rounded-xl hover:bg-gray-50 transition">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white mr-4`}>
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{info.title}</h3>
                        <p className="text-gray-600 text-sm">{info.value}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">What could we help you with? *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="input-field resize-none"
                    placeholder="Describe your question or concern..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your password"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Required for account verification</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">WhatsApp (optional)</label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="+251..."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Telegram (optional)</label>
                    <input
                      type="text"
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="@username"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-lg">
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    <>
                      <FaPaperPlane className="inline mr-2" /> Submit
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import {
  useAuth,
} from '../context/AuthContext';

const Login = () => {

  const navigate =
    useNavigate();

  const {
    user,
    login,
  } = useAuth();

  /*
  =====================================
  STATES
  =====================================
  */

  const [formData, setFormData] =
    useState({
      email: '',
      password: '',
    });

  const [loading, setLoading] =
    useState(false);

  /*
  =====================================
  AUTO LOGIN
  =====================================
  */

  useEffect(() => {

    if (user) {

      navigate('/chat');

    }

  }, [user, navigate]);

  /*
  =====================================
  HANDLE CHANGE
  =====================================
  */

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });

  };

  /*
  =====================================
  SUBMIT
  =====================================
  */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res =
        await axios.post(
          'http://localhost:5000/api/auth/login',
          formData
        );

      login(
        res.data.user,
        res.data.token
      );

      navigate('/chat');

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data
          ?.message ||
          'Something went wrong'
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] overflow-hidden relative">

      {/* Blur circles */}

      <div className="absolute w-72 h-72 bg-green-500/20 rounded-full blur-3xl top-10 left-10"></div>

      <div className="absolute w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl bottom-10 right-10"></div>

      {/* Glass Card */}

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl w-[400px] shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-gray-300 text-center mb-8">
          Login to continue chatting
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-green-400 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-green-400 transition"
          />

          <button
            disabled={loading}
            className="w-full bg-green-500/80 hover:bg-green-500 text-white py-3 rounded-xl font-semibold transition duration-300 shadow-lg"
          >

            {loading
              ? 'Loading...'
              : 'Login'}

          </button>

        </form>

        <p className="text-gray-300 text-center mt-6">

          Don&apos;t have an account?{' '}

          <Link
            to="/signup"
            className="text-green-400 hover:text-green-300 font-medium"
          >
            Signup
          </Link>

        </p>

      </div>

    </div>

  );

};

export default Login;
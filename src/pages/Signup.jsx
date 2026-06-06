// Signup.jsx

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useState } from 'react'

import axios from 'axios'

const Signup = () => {
  const navigate =
    useNavigate()

  /*
  =====================================
  STATES
  =====================================
  */

  const [formData, setFormData] =
    useState({
      name: '',
      email: '',
      password: '',
    })

  const [loading, setLoading] =
    useState(false)

  /*
  =====================================
  HANDLE INPUT
  =====================================
  */

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    })
  }

  /*
  =====================================
  SUBMIT
  =====================================
  */

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault()

    try {
      setLoading(true)

      /*
      SEND OTP
      */

      const res =
        await axios.post(
          'https://whatsapp-backend-xz82.onrender.com/api/auth/send-otp',

          formData
        )

      /*
      SAVE FULL SIGNUP DATA
      */

      localStorage.setItem(
        'signupData',

        JSON.stringify(
          formData
        )
      )

      /*
      SAVE EMAIL
      */

      localStorage.setItem(
        'signupEmail',

        formData.email
      )

      alert(
        res.data.message
      )

      /*
      NAVIGATE OTP PAGE
      */

      navigate('/otp')
    } catch (error) {
      console.log(error)

      console.log(
        error.response
      )

      alert(
        error?.response?.data
          ?.message ||
          'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] overflow-hidden relative">
      
      {/* Blur Background */}

      <div className="absolute w-72 h-72 bg-green-500/20 rounded-full blur-3xl top-10 left-10"></div>

      <div className="absolute w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl bottom-10 right-10"></div>

      {/* Glass Card */}

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl w-[400px] shadow-2xl">

        {/* Heading */}

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        <p className="text-gray-300 text-center mb-8">
          Signup to start chatting
        </p>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Name */}

          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={formData.name}
            onChange={
              handleChange
            }
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-green-400 transition"
          />

          {/* Email */}

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={
              handleChange
            }
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-green-400 transition"
          />

          {/* Password */}

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={
              formData.password
            }
            onChange={
              handleChange
            }
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-green-400 transition"
          />

          {/* Button */}

          <button className="w-full bg-green-500/80 hover:bg-green-500 text-white py-3 rounded-xl font-semibold transition duration-300 shadow-lg">

            {loading
              ? 'Loading...'
              : 'Signup'}

          </button>

        </form>

        {/* Login Link */}

        <p className="text-gray-300 text-center mt-6">

          Already have an account?{' '}

          <Link
            to="/login"
            className="text-green-400 hover:text-green-300 font-medium"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  )
}

export default Signup
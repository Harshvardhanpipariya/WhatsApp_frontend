
import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import {
  useNavigate,
} from 'react-router-dom';

const Otp = () => {

  const navigate =
    useNavigate();

  /*
  =====================================
  STATES
  =====================================
  */

  const [otp, setOtp] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [timer, setTimer] =
    useState(90);

  /*
  =====================================
  GET EMAIL
  =====================================
  */

  const email =
    localStorage.getItem(
      'signupEmail'
    );

  /*
  =====================================
  GET SIGNUP DATA
  =====================================
  */

  const signupData =
    JSON.parse(
      localStorage.getItem(
        'signupData'
      )
    );

  /*
  =====================================
  TIMER
  =====================================
  */

  useEffect(() => {

    if (timer <= 0) return;

    const interval =
      setInterval(() => {

        setTimer(
          (prev) => prev - 1
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [timer]);

  /*
  =====================================
  FORMAT TIMER
  =====================================
  */

  const formatTime = (
    time
  ) => {

    const minutes =
      Math.floor(time / 60);

    const seconds =
      time % 60;

    return `${minutes}:${
      seconds < 10
        ? '0'
        : ''
    }${seconds}`;
  };

  /*
  =====================================
  VERIFY OTP
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

          'http://localhost:5000/api/auth/verify-otp',

          {
            email,
            otp,
          }
        );

      alert(
        res.data.message
      );

      navigate('/setup');

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

  /*
  =====================================
  RESEND OTP
  =====================================
  */

  const handleResendOTP =
    async () => {

      try {

        setResending(true);

        const res =
          await axios.post(

            'http://localhost:5000/api/auth/send-otp',

            signupData
          );

        alert(
          res.data.message
        );

        setTimer(90);

        setOtp('');

      } catch (error) {

        console.log(error);

        alert(
          error?.response?.data
            ?.message ||
            'Something went wrong'
        );

      } finally {

        setResending(false);

      }
    };

  return (

    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] overflow-hidden relative px-4">

      {/* Blur */}

      <div className="absolute w-72 h-72 bg-green-500/20 rounded-full blur-3xl top-10 left-10"></div>

      <div className="absolute w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl bottom-10 right-10"></div>

      {/* Card */}

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl w-[400px] shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Verify OTP
        </h1>

        <p className="text-gray-300 text-center mb-8">

          OTP sent to{' '}

          <span className="text-green-400 font-medium">
            {email}
          </span>

        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <input
            type="text"

            placeholder="Enter OTP"

            value={otp}

            onChange={(e) =>
              setOtp(
                e.target.value
              )
            }

            maxLength={6}

            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-300 px-4 py-3 rounded-xl outline-none text-center tracking-[10px] text-2xl focus:ring-2 focus:ring-green-400 transition"
          />

          <button
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition duration-300 shadow-lg"
          >

            {loading
              ? 'Verifying...'
              : 'Verify OTP'}

          </button>

          <div className="text-center">

            {timer > 0 ? (

              <p className="text-gray-300 text-sm">

                Resend OTP in{' '}

                <span className="text-green-400 font-semibold">

                  {formatTime(
                    timer
                  )}

                </span>

              </p>

            ) : (

              <button
                type="button"

                onClick={
                  handleResendOTP
                }

                disabled={
                  resending
                }

                className="text-green-400 hover:text-green-300 text-sm font-semibold transition"
              >

                {resending
                  ? 'Sending...'
                  : 'Resend OTP'}

              </button>

            )}

          </div>

        </form>

      </div>

    </div>
  );
};

export default Otp;


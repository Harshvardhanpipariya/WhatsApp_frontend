
import {
  useState,
} from 'react';

import axios from 'axios';

import {
  Camera,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../context/AuthContext';

const SetupProfile = () => {

  const navigate =
  useNavigate();

const {
  login,
} = useAuth();  
  /*
  =====================================
  STATES
  =====================================
  */

  const [image, setImage] =
    useState(null);

  const [preview, setPreview] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  /*
  =====================================
  IMAGE
  =====================================
  */

  const handleImage = (
    e
  ) => {

    const file =
      e.target.files[0];

    if (file) {

      setImage(file);

      const imageUrl =
        URL.createObjectURL(
          file
        );

      setPreview(imageUrl);
    }
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

      const email =
        localStorage.getItem(
          'signupEmail'
        );

      const formData =
        new FormData();

      formData.append(
        'email',
        email
      );

      if (image) {

        formData.append(
          'photo',
          image
        );
      }

      const res =
        await axios.post(

          'http://localhost:5000/api/auth/complete-signup',

          formData
        );

      /*
      SAVE TOKEN
      */

      login(
        res.data.user,
        res.data.token
      );

      /*
      REMOVE TEMP
      */

      localStorage.removeItem(
        'signupEmail'
      );

      localStorage.removeItem(
        'signupData'
      );

      alert(
        'Account Created'
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

  /*
  =====================================
  SKIP
  =====================================
  */

  const handleSkip = async () => {

    try {

      setLoading(true);

      const email =
        localStorage.getItem(
          'signupEmail'
        );

      const formData =
        new FormData();

      formData.append(
        'email',
        email
      );

      const res =
        await axios.post(

          'http://localhost:5000/api/auth/complete-signup',

          formData
        );

        login(
          res.data.user,
          res.data.token
        );

      localStorage.removeItem(
        'signupEmail'
      );

      localStorage.removeItem(
        'signupData'
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

    <div className="h-screen bg-[#111b21] flex items-center justify-center px-4">

      <div className="bg-[#202c33] w-full max-w-md rounded-2xl p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Setup Profile
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Add your profile picture
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Upload */}

          <div className="flex justify-center">

            <label className="relative cursor-pointer">

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImage}
              />

              <div className="w-28 h-28 rounded-full bg-[#2a3942] overflow-hidden flex items-center justify-center border-2 border-green-500">

                {preview ? (

                  <img
                    src={preview}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <Camera className="text-gray-400 w-10 h-10" />

                )}

              </div>

              <div className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full">

                <Camera className="text-white w-4 h-4" />

              </div>

            </label>

          </div>

          {/* Buttons */}

          <div className="flex gap-3">

            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="w-1/2 bg-[#2a3942] hover:bg-[#36454f] text-white py-3 rounded-lg font-semibold transition"
            >

              Skip

            </button>

            <button
              disabled={loading}
              className="w-1/2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition"
            >

              {loading
                ? 'Please wait...'
                : 'Continue'}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default SetupProfile;

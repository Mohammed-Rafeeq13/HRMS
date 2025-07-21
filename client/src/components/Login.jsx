import React from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";

const Login = ({setAuthMode,setUser}) => {
  const [Loding, setLoding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    setLoding(true);
    try {
      const response = await axios.post("http://localhost:5000/api/signIn", data, { withCredentials: true });
      if (response.data.success) {
       setUser(response.data.user)
      }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
      }
    setLoding(false);
  };

  return (
    <div>
      <ToastContainer />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 lg:p-8 mobile-margin">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 text-center">
            Sign In
          </h2>

          <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit}>


            <div>
              <label className="form-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="form-input btn-touch"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-input btn-touch"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <a
                href="#"
                className="text-sm text-indigo-600 hover:text-indigo-500 btn-touch"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn-primary btn-touch-large w-full"
              disabled={Loding}
            >
              {Loding ? "Loading..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?
            <div
            onClick={()=>{setAuthMode("regester")}}
              className="text-indigo-600 hover:text-indigo-500 font-medium cursor-pointer btn-touch inline-block ml-1"
            >
              Sign up
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";

const Register = ({ setAuthMode }) => {
  const [Loding, setLoding] = useState(false);
  const [image, setImage] = useState("");

  function convertImageToBase64(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    callback(reader.result); 
  };
}



  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      contact: formData.get("contact"),
      email: formData.get("email"),
      password: formData.get("password"),
      location: formData.get("location"),
      role: formData.get("role"),
      image: image,
    };
    setLoding(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/signUp",
        data
      );
      toast(response.data.message || "Internal Server Error");
      if (response.data.success) {
        setAuthMode("login")
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
            Sign Up
          </h2>

          <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center">
              <input
                type="file"
                name="image"
                style={{
                  backgroundImage: `url('https://tse1.mm.bing.net/th?id=OIP.8xC-Y-eFY84Set5-4ubV5AHaE7&pid=Api&P=0&h=180')`,
                  backgroundSize: "200%",
                }}
                className="rounded-full bg-white bg-cover text-transparent h-[100px] w-[100px] bg-center  px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                onChange={(e) => {
                  const file = e.target.files[0];
                  convertImageToBase64(file, (base64Image) => {
                    alert(1111)
                    setImage(base64Image);
                    e.target.style.backgroundImage = `url(${base64Image})`;
                  });
                }}
              />
            </div>
            <div>
              <label className="form-label">
                Name
              </label>
              <input
                type="text"
                name="name"
                className="form-input btn-touch"
                placeholder="Pawan singh"
              />
            </div>
            <div>
              <label className="form-label">
                Contact
              </label>
              <input
                type="tel"
                name="contact"
                className="form-input btn-touch"
                placeholder="+91 1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                name="role"
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="software enginner"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                location
              </label>
              <input
                type="text"
                name="location"
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <a
                href="#"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              disabled={Loding}
            >
              {Loding ? "Loading..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?
            <div
              onClick={() => {
                setAuthMode("login");
              }}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

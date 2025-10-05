import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getCookie, setCookie } from "../../utils/cookiesApi";
import axiosInstance from "../../config/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import PasswordInp from "./PasswordInp";
import Loader from "../../components/common/Loader";
import GoogleBox from "../../components/GoogleBox";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../../../store/userSlice";
import loginImg from "../../assets/bg-login.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [isUserLogin, setIsUserLogin] = useState(true); // toggle login type
  const currentUserData = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   if (currentUserData?._id) {
  //     navigate("/dashboard");
  //   }
  // }, [currentUserData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isUserLogin ? "/user/login" : "/therapist/login";
      const res = await axiosInstance.post(endpoint, { ...data });

      toast.success(res?.data?.message || "Success");
      setCookie("user_token", res?.data?.token);
      if (isUserLogin) {
        dispatch(addUser({ ...res?.data?.user, role: "user" }));
        navigate("/dashboard");
      } else {
        dispatch(addUser({ ...res?.data?.user, role: "therapist" }));
        navigate("/therapist/dashboard");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6  md:overflow-hidden">
      <img
        src={loginImg}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        alt=""
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative shadow-xl glass rounded-3xl mx-auto p-8 w-full max-w-md text-center z-10"
      >
        <h1 className="text-3xl font-semibold font-technical text-stone-200 mb-6">
          Welcome Back
        </h1>

        {/* Toggle between User / Therapist */}
        <div className="flex gap-4 mb-6">
          <div
            onClick={() => setIsUserLogin(true)}
            className={`flex-1 py-2 rounded-lg cursor-pointer font-technical  transition-all duration-300 ${
              isUserLogin
                ? "glass border text-white "
                : "border border-background border-gray-700 text-white"
            }`}
          >
            User
          </div>
          <div
            onClick={() => setIsUserLogin(false)}
            className={`flex-1 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
              !isUserLogin
                ? "glass border text-white "
                : "border border-gray-700 text-white"
            }`}
          >
            Therapist / Mentor
          </div>
        </div>

        {/* Form */}
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full p-2 px-3 rounded-lg glass dark:bg-gray-800 dark:text-gray-50 focus:ring-2 focus:ring-text-gradient-secondary outline-none"
            type="email"
            onChange={handleChange}
            name="email"
            placeholder="Email"
            required
          />
          <PasswordInp
            onChange={handleChange}
            placeholder="Password"
            name="password"
          />
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-gradient-to-r from-gradient-primary to-gradient-secondary flex items-center justify-center hover:bg-text-gradient-secondary transition-all duration-300 text-white font-semibold rounded-lg"
          >
            {loading ? <Loader /> : "Login"}
          </motion.button>
        </form>

        {/* Register redirect */}
        <div className="mt-4 text-gray-600 dark:text-gray-300">
          Not Having an Account?{" "}
          <Link
            to="/register"
            className="text-gradient-secondary font-semibold"
          >
            Register here
          </Link>
        </div>

        {/* Divider */}
        <div className="my-3 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-400" />
          <span className="text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-400" />
        </div>

        {/* Google Auth */}
        {isUserLogin && <GoogleBox setIsLoading={setLoading} />}
      </motion.div>
    </div>
  );
}

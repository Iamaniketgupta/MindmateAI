import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../../../store/userSlice";
import axiosInstance from "../../config/axiosConfig.js";
import GoogleBox from "../../components/GoogleBox.jsx";
import loginImg from "../../assets/bg-login.jpg";
import UserRegister from "./componenets/UserRegister";
import TherapistRegister from "./componenets/TherapistRegister";

const cookies = new Cookies(null, { path: "/" });

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [asUserRegister, setAsUserRegister] = useState(true);

  const currentUserData = useSelector((state) => state.user);

  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    dob: "",
    gender: "",
    phone: "",
  });

  const [therapistData, setTherapistData] = useState({
    email: "",
    password: "",
    name: "",
    specialization: [],
    experience: "",
    gender: "",
    phone: "",
    virtualFee: "",
    type: "Therapist", // default
  });

  const userOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const therapistOnChange = (e) => {
    const { name, value } = e.target;
    if (name === "specialization") {
      setTherapistData((prev) => ({
        ...prev,
        specialization: value.split(",").map((s) => s.trim()),
      }));
    } else if (name === "type") {
      setTherapistData((prev) => ({ ...prev, type: value }));
    } else {
      setTherapistData((prev) => ({ ...prev, [name]: value }));
    }
  };

    useEffect(() => {
      if (currentUserData?._id) {
      if (asUserRegister) {
        navigate("/chat");
      } else {
        navigate("/therapist/dashboard");
      }
      }
    }, [currentUserData]);

    
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (asUserRegister) {
        res = await axiosInstance.post("/user/register", data);
      } else {
        res = await axiosInstance.post("/therapist/register", therapistData);
      }

      toast.success(res?.data?.message || "Success");
      cookies.set("user_token", res?.data?.token);

      if (res?.data?.user) {
        dispatch(addUser(res?.data?.user));
      }

      if (asUserRegister) {
        navigate("/chat");
      } else {
        navigate("/therapist/dashboard");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // console.log({asUserRegister})

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <img
        src={loginImg}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        alt=""
      />

      <div className="relative z-10 shadow-xl glass rounded-3xl mx-auto p-8 w-full max-w-xl text-center">
        <h1 className="text-3xl font-semibold font-technical text-stone-200 mb-6">
          REGISTER HERE
        </h1>

        {/* Toggle User/Therapist */}
        <div className="flex gap-4 mb-6">
          <div
            onClick={() => setAsUserRegister(true)}
            className={`flex-1 py-2  rounded-lg cursor-pointer font-technical transition-all duration-300 ${
              asUserRegister
                ? "glass border text-white"
                : "border border-gray-700 text-white"
            }`}
          >
            As User
          </div>
          <div
            onClick={() => setAsUserRegister(false)}
            className={`flex-1 py-2 rounded-lg cursor-pointer font-technical transition-all duration-300 ${
              !asUserRegister
                ? "glass border text-white"
                : "border border-gray-700 text-white"
            }`}
          >
            Therapist / Mentor
          </div>
        </div>

        {/* Form */}
        {asUserRegister ? (
          <UserRegister
            handleChange={userOnChange}
            handleSubmit={handleSubmit}
            loading={loading}
            glassInput={true} // pass prop to apply glass style inside
          />
        ) : (
          <TherapistRegister
            handleChange={therapistOnChange}
            handleSubmit={handleSubmit}
            loading={loading}
            glassInput={true}
          />
        )}

        <div className="mt-2 text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-gradient-secondary font-semibold">
            Login here
          </Link>
        </div>

        <div className="my-3 flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-gray-400" />
          <span className="text-gray-500">or</span>
          <div className="flex-1 h-[1px] bg-gray-400" />
        </div>

        {/* {
          asUserRegister && 
        <GoogleBox setIsLoading={setLoading} />
        } */}
      </div>
    </div>
  );
};

export default Register;

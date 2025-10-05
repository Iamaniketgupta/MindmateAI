import React from "react";
import PasswordInp from "../PasswordInp";
import { Link } from "react-router-dom";
import Loader from "../../../components/common/Loader";

export default function UserRegister({ handleSubmit, handleChange, loading }) {
  return (
    <form className="w-full" onSubmit={(e) => handleSubmit(e)}>
      <input
        className="w-full glass my-2 p-2 px-3 text-white outline-none rounded-md  border-gradient-secondary border "
        type="text"
        onChange={handleChange}
        name="name"
        placeholder="Full Name"
        required
      />
      <br />

      <div className="flex items-center gap-4 ">
        <input
          className="w-full glass flex-1  my-2 p-2 px-3 outline-none rounded-md text-white "
          type="email"
          onChange={handleChange}
          name="email"
          placeholder="Email"
          required
        />

        <div className="flex-1 ">
          <PasswordInp
            onChange={handleChange}
            placeholder={"Password"}
            name={"password"}
          />
        </div>
      </div>

      <input
        className="w-full glass my-2 p-2 px-3 outline-none rounded-md text-white  border "
        type="tel"
        onChange={handleChange}
        name="phone"
        placeholder="Phone"
        required
      />
      <div className="flex items-center gap-4">
        <select
          className="w-full my-2 p-2 px-3 outline-none rounded-md bg-gray-800 text-white  "
          onChange={handleChange}
          name="type"
          required
        >
          <option value="">Select Type</option>
          <option value="student">Student</option>
          <option value="professional">Professional</option>
          <option value="retired">Retired</option>
          <option value="unemployed">UnEmployed</option>
        </select>

        {/* Gender Selection */}
        <select
          className="w-full my-2 p-2 px-3 outline-none rounded-md text-white  bg-gray-800 "
          onChange={handleChange}
          name="gender"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      {/* Date of Birth Field */}
      <input
        className="w-full glass my-2 p-2 px-3 outline-none rounded-md text-white border-gradient-secondary border "
        type="date"
        onChange={handleChange}
        name="dob"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r mt-2 from-gradient-primary to-gradient-secondary flex items-center justify-center hover:bg-text-gradient-secondary transition-all duration-300 text-white font-semibold rounded-lg"
      >
        {loading ? <Loader /> : "Sign Up"}
      </button>
    </form>
  );
}

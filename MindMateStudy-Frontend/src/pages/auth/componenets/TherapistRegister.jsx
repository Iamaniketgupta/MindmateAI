import React from "react";
import PasswordInp from "../PasswordInp";
import { Link } from "react-router-dom";
import Loader from "../../../components/common/Loader";

export default function TherapistRegister({
  handleSubmit,
  handleChange,
  loading,
}) {
  return (
    <form className="w-full" onSubmit={handleSubmit}>
      {/* Full Name */}
      
      <input
        className="w-full glass my-2 p-2 px-3 text-white outline-none rounded-md "
        type="text"
        onChange={handleChange}
        name="name"
        placeholder="Full Name"
        required
      />

      {/* Email + Password */}
      <div className="flex items-center gap-4">
        <input
          className="w-full glass flex-1 my-2 p-2 px-3 text-white outline-none rounded-md "
          type="email"
          onChange={handleChange}
          name="email"
          placeholder="Email"
          required
        />
        <div className="flex-1">
          <PasswordInp
            onChange={handleChange}
            placeholder="Password"
            name="password"
          />
        </div>
      </div>

      {/* Phone */}
      <input
        className="w-full glass my-2 p-2 px-3 text-white outline-none rounded-md "
        type="tel"
        onChange={handleChange}
        name="phone"
        placeholder="Phone"
        required
      />

      {/* Gender + Experience */}
      <div className="flex items-center gap-4">
        <select
          className="w-full  my-2 p-2 px-3 text-white outline-none rounded-md  bg-gray-800"
          onChange={handleChange}
          name="gender"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          className="w-full  my-2 p-2 px-3 text-white outline-none rounded-md  bg-gray-800"
          type="number"
          onChange={handleChange}
          name="experience"
          placeholder="Years of Experience"
          min="0"
          required
        />
      </div>

      {/* Virtual Fee + Specialization */}
      <div className="flex items-center gap-4">
        <input
          className="w-full glass my-2 p-2 px-3 text-white outline-none rounded-md "
          type="number"
          onChange={handleChange}
          name="virtualFee"
          placeholder="Virtual Consultation Fee (Rs)"
          min="0"
          required
        />
        <input
          className="w-full glass my-2 p-2 px-3 text-white outline-none rounded-md border "
          type="text"
          onChange={handleChange}
          name="specialization"
          placeholder="Specializations (comma separated)"
          required
        />
      </div>

      {/* Type (Therapist or Mentor) */}
      <select
        className="w-full  my-2 p-2 px-3 bg-gray-800 text-white outline-none rounded-md "
        onChange={handleChange}
        name="type"
        required
      >
        <option value="Therapist">Therapist</option>
        <option value="Mentor">Mentor</option>
      </select>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-3 bg-gradient-to-r from-gradient-primary to-gradient-secondary flex items-center justify-center hover:bg-text-gradient-secondary transition-all duration-300 text-white font-semibold rounded-lg"
      >
        {loading ? <Loader /> : "Sign Up"}
      </button>
    </form>
  );
}

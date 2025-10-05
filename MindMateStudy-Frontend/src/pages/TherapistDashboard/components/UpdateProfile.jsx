import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../../../config/axiosConfig";
import { addUser } from "../../../../store/userSlice";

const UpdateProfile = () => {
  const user = useSelector((state) => state.user);
  const therapistId = user?._id;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    virtualFee: "",
    specialization: "",
    experience: "",
    gender: "",
    type: ""
  });

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        virtualFee: user.virtualFee || "",
        specialization: user.specialization?.join(", ") || "",
        experience: user.experience || "",
        gender: user.gender || "",
        type: user.type || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        specialization: formData.specialization.split(",").map((s) => s.trim()),
      };

      const res = await axiosInstance.put(`/therapist/${therapistId}`, payload);
      toast.success("Profile updated successfully!");
      
      dispatch(addUser(res?.data?.therapist));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="min-h-screen flex items-center justify-center px-6 py-12"
  style={{ backgroundColor: "#020817" }}
>
  <div className="glass border border-glass-border rounded-2xl hover-lift hover:shadow-[var(--color-shadow-glow)] p-10 w-full max-w-4xl transition-all text-white">
    
    {/* Header */}
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold">Update Profile</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Edit your information below
      </p>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Full Name */}
      <div>
        <label className="block mb-1 font-medium">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 rounded-lg outline-none border border-gray-700 bg-transparent focus:border-primary transition"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block mb-1 font-medium">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-3 rounded-lg outline-none border border-gray-700 bg-transparent focus:border-primary transition"
          required
        />
      </div>

      {/* Virtual Fee */}
      <div>
        <label className="block mb-1 font-medium">Virtual Fee ($)</label>
        <input
          type="number"
          name="virtualFee"
          value={formData.virtualFee}
          onChange={handleChange}
          className="w-full p-3 rounded-lg outline-none border border-gray-700 bg-transparent focus:border-primary transition"
          required
        />
      </div>

      {/* Experience */}
      <div>
        <label className="block mb-1 font-medium">Years of Experience</label>
        <input
          type="number"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          className="w-full p-3 rounded-lg outline-none border border-gray-700 bg-transparent focus:border-primary transition"
          required
        />
      </div>

      {/* Specializations */}
      <div className="md:col-span-2">
        <label className="block mb-1 font-medium">Specializations</label>
        <input
          type="text"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          placeholder="Comma separated (e.g., Anxiety, Depression)"
          className="w-full p-3 rounded-lg outline-none border border-gray-700 bg-transparent focus:border-primary transition"
          required
        />
      </div>

      {/* Gender */}
      <div className="md:col-span-2">
        <label className="block mb-1 font-medium">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full p-3 rounded-lg outline-none border border-gray-700 bg-transparent focus:border-primary transition"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer not to say">Prefer not to say</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </div>

    </form>
  </div>
</div>

  );
};

export default UpdateProfile;

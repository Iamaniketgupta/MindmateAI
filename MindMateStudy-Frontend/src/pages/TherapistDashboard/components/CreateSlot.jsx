import React, { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../config/axiosConfig";
import { useSelector } from "react-redux";

const CreateSlot = () => {
  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([{ start: "", end: "" }]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);

  const handleTimeChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

  const addMoreSlot = () => {
    setTimeSlots([...timeSlots, { start: "", end: "" }]);
  };

  const removeSlot = (index) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || timeSlots.some((slot) => !slot.start)) {
      toast.error("Please fill all fields");
      return;
    }

    // Format slots: if end time not provided, add 30 minutes
    const formattedSlots = timeSlots.map((slot) => {
      let end = slot.end;
      if (!end) {
        end = new Date(`${date}T${slot.start}`);
        end = new Date(end.getTime() + 30 * 60000); // +30 minutes
        end = end.toTimeString().slice(0, 5); // format HH:mm
      }
      return `${slot.start}-${end}`;
    });

    try {
      setLoading(true);
      const res = await axiosInstance.post("/slot/add", {
        therapist: user._id,
        date,
        timeSlots: formattedSlots,
      });
      toast.success(res?.data?.message || "Slots created successfully!");
      setDate("");
      setTimeSlots([{ start: "", end: "" }]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add slots");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center px-6 py-10">
      <div className="glass border border-glass-border rounded-2xl hover-lift hover:shadow-[var(--color-shadow-glow)] p-8 w-full max-w-lg transition-all">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Create Virtual Slot</h1>
          <p className="text-muted-foreground mt-2">Select date and time slots</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-lg outline-none border border-gray-200 focus:border-primary transition"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">Time Slots</label>
            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => handleTimeChange(index, "start", e.target.value)}
                    className="flex-1 p-3 rounded-lg outline-none border border-gray-200 focus:border-primary transition"
                    required
                  />
                  <span className="text-white">to</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => handleTimeChange(index, "end", e.target.value)}
                    className="flex-1 p-3 rounded-lg outline-none border border-gray-200 focus:border-primary transition"
                  />
                  {timeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMoreSlot}
              className="w-full py-2 mt-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition"
            >
              + Add Another Time Slot
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gradient-secondary to-gradient-primary text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Creating..." : "Create Slot"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSlot;

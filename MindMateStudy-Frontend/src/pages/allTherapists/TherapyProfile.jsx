import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { RiVerifiedBadgeFill, RiStarFill, RiCalendarEventLine } from 'react-icons/ri';
import dayjs from 'dayjs';
import { FaClock, FaEnvelope, FaPhone, FaMars, FaVenus, FaVideo, FaWallet } from 'react-icons/fa';
import { IoIosFitness, IoMdHeart } from 'react-icons/io';
import toast from 'react-hot-toast';

export default function TherapyProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [therapist, setTherapist] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        const fetchSlot = async () => {
            try {
                const response = await axiosInstance.get(`/slot/${id}`);
                setSlots(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSlot();
    }, [id]);

    useEffect(() => {
        const fetchTherapist = async () => {
            try {
                const response = await axiosInstance.get(`/therapist/${id}`);
                setTherapist(response.data?.therapist);
            } catch (error) {
                console.error(error);
            }
        };
        fetchTherapist();
    }, [id]);

    const handleBooking = async (slotId) => {
        setSelectedSlot(slotId);
        setLoading(true);
        try {
            console.log(slotId);
            const { data } = await axiosInstance.post('/appointment/book', {
                therapistId: id,
                slotId
            });
    
            const { id: orderId, amount, currency } = data.order;
    
            const options = {
                key: import.meta.env.VITE_RAZORPAY_API_KEY,
                amount: amount / 100,
                currency,
                name: "Therapy Session",
                description: "1:1 Consultation",
                order_id: orderId,
                handler: async function (response) {
                    setLoading(false);
                    setSelectedSlot(null);

                    try {
                        const verifyResponse = await axiosInstance.post('/appointment/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
    
                        if (verifyResponse.data.status) {
                            toast.success("Payment successful! Appointment confirmed.");
                            navigate('/appointments');
                        } else {
                            toast.error("Payment verification failed. Please contact support.");
                        }
                    } catch (verifyError) {
                        console.error("Payment verification error:", verifyError);
                        toast.error("Failed to verify payment. Please try again.");
                    }
                },
                prefill: {
                    name: "John Doe",
                    email: "johndoe@example.com",
                    contact: "9876543210"
                },
                theme: { color: "#6366f1" }
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            setLoading(false);
            setSelectedSlot(null);
        } catch (error) {
            console.error("Booking error:", error);
            toast.error("Failed to book appointment. Please try again.");
            setLoading(false);
            setSelectedSlot(null);
        }
    };

    if (!therapist) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Skeleton for Left Side */}
                        <div className="glass animate-pulse rounded-3xl p-8">
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full bg-black mb-6"></div>
                                <div className="h-8 w-64 bg-black rounded-lg mb-4"></div>
                                <div className="h-4 w-48 bg-black rounded-lg mb-2"></div>
                                <div className="h-4 w-32 bg-black rounded-lg"></div>
                            </div>
                        </div>
                        
                        {/* Skeleton for Right Side */}
                        <div className="glass animate-pulse rounded-3xl p-8">
                            <div className="h-8 w-48 bg-black rounded-lg mb-6"></div>
                            <div className="grid grid-cols-2 gap-4">
                                {Array(6).fill(0).map((_, index) => (
                                    <div key={index} className="bg-black-600/20 rounded-2xl p-6 h-32"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black-900 to-slate-900 p-4 relative overflow-hidden">
            {/* Background Animation Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-black-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl"></div>
            </div>

            {/* Full-Screen Loader */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="glass rounded-2xl p-8 flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-black-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-white font-semibold">Processing your booking...</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Therapist Profile Card */}
                    <div className="glass rounded-3xl p-8 transform hover:scale-[1.02] transition-all duration-300">
                        <div className="flex flex-col items-center text-center">
                            {/* Profile Image with Glow Effect */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-black-500/20 rounded-full blur-lg transform scale-110"></div>
                                <img
                                    src={therapist.avatar || "https://img.freepik.com/premium-vector/avatar-icon0002_750950-43.jpg?semt=ais_hybrid"}
                                    alt={therapist.name}
                                    className="w-32 h-32 rounded-full object-cover shadow-2xl relative z-10 border-4 border-white/20"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-gradient-secondary to-gradient-primary rounded-full p-2 shadow-lg">
                                    <RiVerifiedBadgeFill className="text-white text-xl" />
                                </div>
                            </div>

                            {/* Name and Specialization */}
                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                Dr. {therapist.name}
                                <span className="text-yellow-400 text-2xl">
                                    <RiStarFill />
                                </span>
                            </h1>
                            
                            <div className="glass-inner rounded-full px-4 py-2 mb-4">
                                <p className="text-black-200 font-medium text-sm">
                                    Specialized in {therapist.specialization.join(', ')}
                                </p>
                            </div>

                            {/* Experience and Rating */}
                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex items-center gap-2 text-black-200">
                                    <FaClock className="text-black-300" />
                                    <span className="font-semibold text-white">{therapist.experience}+ Years</span>
                                </div>
                                <div className="flex items-center gap-2 text-yellow-300">
                                    <RiStarFill />
                                    <span className="font-semibold">4.9/5</span>
                                </div>
                            </div>

                            {/* Consultation Info */}
                            <div className="glass-inner rounded-2xl p-6 w-full mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="glass-icon p-3 rounded-2xl">
                                            <FaVideo className="text-black-300 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-black-200 text-sm">Online Session</p>
                                            <p className="text-white font-bold text-lg">1:1 Consultation</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="glass-icon p-3 rounded-2xl">
                                            <FaWallet className="text-black-300 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-black-200 text-sm">Session Fee</p>
                                            <p className="text-white font-bold text-2xl">₹{therapist.virtualFee}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 w-full">
                                <div className="text-center">
                                    <div className="glass-inner rounded-2xl p-3">
                                        <IoMdHeart className="text-black-300 text-2xl mx-auto mb-1" />
                                        <p className="text-white font-bold text-lg">500+</p>
                                        <p className="text-black-200 text-xs">Sessions</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="glass-inner rounded-2xl p-3">
                                        <IoIosFitness className="text-black-300 text-2xl mx-auto mb-1" />
                                        <p className="text-white font-bold text-lg">98%</p>
                                        <p className="text-black-200 text-xs">Success Rate</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="glass-inner rounded-2xl p-3">
                                        <RiCalendarEventLine className="text-black-300 text-2xl mx-auto mb-1" />
                                        <p className="text-white font-bold text-lg">{slots.length}</p>
                                        <p className="text-black-200 text-xs">Available</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Available Slots Section */}
                    <div className="glass rounded-3xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="glass-icon p-2 rounded-xl">
                                <RiCalendarEventLine className="text-black-300 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Available Sessions</h2>
                                <p className="text-black-200 text-sm">Book your preferred time slot</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {slots.length > 0 ? slots.map((slot, index) => (
                                <div 
                                    key={index}
                                    className={`glass-inner rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                                        selectedSlot === slot._id ? 'ring-2 ring-black-400 scale-105' : ''
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="glass-icon rounded-full px-4 py-2 mb-3 inline-block">
                                            <p className="text-black-300 font-semibold text-sm">
                                                {dayjs(slot.date).format('DD MMM YYYY')}
                                            </p>
                                        </div>
                                        <p className="text-white text-2xl font-bold mb-4">{slot.timeSlot}</p>
                                        <button
                                            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                                                selectedSlot === slot._id 
                                                    ? 'bg-gradient-to-r from-gradient-secondary to-gradient-primary shadow-lg shadow-black-500/30' 
                                                    : 'bg-gradient-to-r from-gradient-secondary to-gradient-primary hover:opacity-90 shadow-lg hover:shadow-black-500/20'
                                            } text-white transform hover:scale-105 active:scale-95`}
                                            onClick={() => handleBooking(slot._id)}
                                            disabled={loading}
                                        >
                                            {selectedSlot === slot._id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                'Book This Slot'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 text-center py-12">
                                    <RiCalendarEventLine className="text-black-300 text-5xl mx-auto mb-4" />
                                    <p className="text-white text-xl font-semibold mb-2">No slots available</p>
                                    <p className="text-black-200">Please check back later for new availability</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add CSS for glass effects and custom scrollbar */}
            <style jsx>{`
                .glass {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                
                .glass-inner {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .glass-icon {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
}
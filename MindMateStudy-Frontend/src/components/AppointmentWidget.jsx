import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Phone, MoreVertical, Plus, Filter, Search, User, Star, AlertCircle } from 'lucide-react';

const AppointmentsWidget = () => {
  const [viewMode, setViewMode] = useState('upcoming'); // upcoming, past, all
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const appointmentsData = {
    upcoming: [
      {
        id: 1,
        therapist: {
          name: "Dr. Sarah Chen",
          specialization: "Cognitive Behavioral Therapy",
          rating: 4.9,
          avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=50&h=50&fit=crop&crop=face",
          experience: "8 years"
        },
        date: "2024-01-15",
        time: "14:30 - 15:30",
        duration: "60 min",
        type: "Video Call",
        status: "confirmed",
        meetingLink: "https://meet.therapy.com/abc123",
        notes: "Focus on anxiety management techniques"
      },
      {
        id: 2,
        therapist: {
          name: "Dr. Michael Rodriguez",
          specialization: "Trauma Therapy",
          rating: 4.7,
          avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop&crop=face",
          experience: "12 years"
        },
        date: "2024-01-16",
        time: "10:00 - 11:00",
        duration: "60 min",
        type: "Phone Call",
        status: "confirmed",
        phoneNumber: "+1-555-0123",
        notes: "Follow-up session"
      },
      {
        id: 3,
        therapist: {
          name: "Dr. Emily Watson",
          specialization: "Mindfulness & Meditation",
          rating: 4.8,
          avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=50&h=50&fit=crop&crop=face",
          experience: "6 years"
        },
        date: "2024-01-18",
        time: "16:00 - 16:50",
        duration: "50 min",
        type: "In-Person",
        status: "pending",
        location: "123 Wellness St, Suite 405",
        notes: "First session - intake assessment"
      }
    ],
    past: [
      {
        id: 4,
        therapist: {
          name: "Dr. James Wilson",
          specialization: "Career Counseling",
          rating: 4.6,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
          experience: "10 years"
        },
        date: "2024-01-08",
        time: "11:00 - 12:00",
        duration: "60 min",
        type: "Video Call",
        status: "completed",
        notes: "Discussed career transition strategies",
        outcome: "positive"
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video Call': return Video;
      case 'Phone Call': return Phone;
      case 'In-Person': return MapPin;
      default: return Calendar;
    }
  };

  const AppointmentCard = ({ appointment, compact = false }) => {
    const TypeIcon = getTypeIcon(appointment.type);
    
    
    return (
      <div className="group glass rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover-lift">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={appointment.therapist.avatar} 
              alt={appointment.therapist.name}
              className="w-10 h-10 rounded-full border-2 border-gray-600"
            />
            <div>
              <h4 className="font-semibold text-white">{appointment.therapist.name}</h4>
              <p className="text-sm text-gray-400">{appointment.therapist.specialization}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{new Date(appointment.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <TypeIcon className="w-4 h-4 text-green-400" />
            <span>{appointment.type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{appointment.therapist.rating}</span>
          </div>
        </div>

        {appointment.notes && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{appointment.notes}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{appointment.duration}</span>
            <span>•</span>
            <span>{appointment.therapist.experience} experience</span>
          </div>
          
          {appointment.status === 'confirmed' && (
            <button className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
              Join Session
            </button>
          )}
          
          {appointment.status === 'pending' && (
            <button className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 transition-all">
              Confirm
            </button>
          )}
        </div>
      </div>
    );
  };

  const TherapistStats = () => (
    <div className="glass rounded-xl p-4 mb-6">
      <h4 className="font-semibold text-white mb-4">Therapist Overview</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{appointmentsData.upcoming.length}</div>
          <div className="text-xs text-gray-400">Upcoming</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{appointmentsData.past.length}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">4.8</div>
          <div className="text-xs text-gray-400">Avg Rating</div>
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="glass rounded-xl p-4">
      <h4 className="font-semibold text-white mb-3">Quick Actions</h4>
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-all">
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-all">
          <Video className="w-4 h-4" />
          Video Setup
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all">
          <Calendar className="w-4 h-4" />
          Schedule
        </button>
      </div>
    </div>
  );

  return (
    <div className="glass rounded-2xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Therapy Appointments</h3>
          <p className="text-gray-400">Manage your therapy sessions and consultations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search therapists..." 
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 glass rounded-lg p-1 mb-6 w-fit">
        {['upcoming', 'past', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setViewMode(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
              viewMode === tab 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab} ({tab === 'all' ? appointmentsData.upcoming.length + appointmentsData.past.length : appointmentsData[tab]?.length || 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {appointmentsData.upcoming.length}
              </div>
              <div className="text-xs text-gray-400">Scheduled</div>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">2</div>
              <div className="text-xs text-gray-400">This Week</div>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">94%</div>
              <div className="text-xs text-gray-400">Attendance Rate</div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {(viewMode === 'all' ? [...appointmentsData.upcoming, ...appointmentsData.past] : appointmentsData[viewMode])
              .map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            
            {(!appointmentsData[viewMode] || appointmentsData[viewMode].length === 0) && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No {viewMode} appointments found</p>
                <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all">
                  Schedule New Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TherapistStats />
          <QuickActions />
          
          {/* Next Appointment Highlight */}
          {appointmentsData.upcoming.length > 0 && (
            <div className="glass rounded-xl p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <h4 className="font-semibold text-white mb-3">Next Session</h4>
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={appointmentsData.upcoming[0].therapist.avatar} 
                  alt={appointmentsData.upcoming[0].therapist.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-white">{appointmentsData.upcoming[0].therapist.name}</p>
                  <p className="text-xs text-gray-400">{appointmentsData.upcoming[0].date}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span>{appointmentsData.upcoming[0].time}</span>
                <span>{appointmentsData.upcoming[0].type}</span>
              </div>
              <button className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all">
                Prepare for Session
              </button>
            </div>
          )}

          {/* Emergency Contact */}
          <div className="glass rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-white">Emergency Contact</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Available 24/7 for urgent support</p>
            <button className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsWidget;
import { MessageCircle, Star, Trophy, Users } from 'lucide-react'
import React from 'react'
import FeatureCard  from './FeatureCard'
import aiMentor from '../../../../assets/ai-mentor.jpg';
export default function MentorSection() {
  return (
     <section className="py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 font-technical">
            <span className="text-gradient-secondary font-technical">Mentors</span> at Your Service
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized guidance from our intelligent mentors, available 24/7 to help you excel in your studies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <FeatureCard
              icon={Users}
              title="Personal AI Mentors"
              description="Connect with specialized AI mentors for every subject, providing personalized learning paths and real-time guidance."
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-gradient-secondary border-2 " />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">200+ Expert Mentors</span>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={MessageCircle}
              title="Real-time Guidance"
              description="Get instant feedback and personalized recommendations as you study, ensuring you're always on the right track."
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span className="text-sm">4.9/5 average rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-warning" />
                  <span className="text-sm">98% student satisfaction</span>
                </div>
              </div>
            </FeatureCard>
          </div>

          <div className="relative">
            <div className="glass lg:p-8 p-2 rounded-2xl">
              <div className="relative">
                <img 
                  src={aiMentor} 
                  alt="AI Mentor" 
                  className="w-full h-96 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-xl" />
                
                {/* Floating conversation bubble */}
                <div className="absolute top-4 right-4 glass rounded-2xl p-4 max-w-sm ">
                  <p className="text-sm text-foreground">
                    "I see you're struggling with mental health and career goals.. Let me break down derivatives step by step..."
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <span className="text-xs text-muted-foreground">Mentor typing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ShieldCheck, 
  BarChart2, 
  Award, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Lock 
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: BarChart2,
      title: 'Deep Skill Analytics',
      description: 'Track score progression, topic strength radar charts, speed-to-accuracy correlation, and GitHub-style heatmaps.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: ShieldCheck,
      title: 'Anti-Cheat Engine',
      description: 'Server-side timer validation, strict tab-switch detection with strike warnings, and anti-copy protection.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Award,
      title: 'PDF Certification',
      description: 'Earn cryptographic certificate codes and download verified high-res PDF diplomas upon passing exams.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Flame,
      title: 'Gamified Learning',
      description: 'Earn XP, unlock mastery badges, increase levels, and compete on global, weekly, and quiz-specific leaderboards.',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(15,23,42,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Release badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold mb-6 animate-fade-in shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Next-Generation Online Quiz Tracker & Testing Engine</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Master Technical Skills With{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
              Precision Analytics
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Take timed multi-choice assessments with real-time auto-save, anti-cheat detection, personalized weak-topic recommendations, and verifiable PDF certificates.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <span>Start Practicing Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <span>Candidate Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-xl">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">5+</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Core Tech Domains</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400">50+</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Vetted Questions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Server Anti-Cheat</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-pink-600 dark:text-pink-400">PDF</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Verified Diplomas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Engineered For High-Stakes Skill Growth
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              QuizTrack provides candidate-first exam ergonomics backed by rigorous enterprise integrity safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pre-seeded Demo Credentials Showcase */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-indigo-700/50">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" /> Ready-To-Test Pre-Seeded Profiles
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold">
            Jump Straight In With Demo Accounts
          </h3>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            The platform is pre-loaded with an Admin account and 3 candidate accounts populated with attempt histories, charts, and unlocked badges.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ADMIN PRIVILEGES
              </span>
              <p className="font-mono text-sm mt-2 text-slate-200">admin@quiztrack.io</p>
              <p className="text-xs text-slate-400">Password: <span className="font-mono text-white">Admin@123</span></p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                USER / CANDIDATE
              </span>
              <p className="font-mono text-sm mt-2 text-slate-200">alice@quiztrack.io</p>
              <p className="text-xs text-slate-400">Password: <span className="font-mono text-white">User@123</span></p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-start">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-indigo-900 bg-white hover:bg-slate-100 shadow-md transition-all hover:scale-105"
            >
              <span>1-Click Login Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { Sparkles, Heart, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              QuizTrack
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
              Enterprise Grade Quiz Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/quizzes" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Quiz Library
            </Link>
            <Link to="/leaderboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Leaderboard
            </Link>
            <Link to="/analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Progress Analytics
            </Link>
            <a 
              href="/api/v1/swagger-ui/index.html" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              API Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            Built with Spring Boot 3 & React • © {new Date().getFullYear()} QuizTrack
          </div>
        </div>
      </div>
    </footer>
  );
}

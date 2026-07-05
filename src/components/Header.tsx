import React from 'react';
import { GoogleUser } from '../types';
import { GraduationCap, Sparkles, LogIn, Lock } from 'lucide-react';

interface HeaderProps {
  user: GoogleUser | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
}

export default function Header({ user, onLogin, onLogout, isLoggingIn }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Santa Rosa Malhas" 
              className="h-9 w-9 object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-bold text-xl tracking-tight text-slate-800">Santa Rosa Malhas</span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-100">Colaboradores</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Portal do Treinador</p>
            </div>
          </div>

          {/* User Section / Action */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Trainer Info */}
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-sm font-semibold text-slate-700">{user.displayName || 'Treinador'}</span>
                  <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-indigo-500" />
                    <span>Treinador / Capacitador</span>
                  </span>
                </div>

                {/* Profile Pic */}
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'TR'}`}
                  alt="Profile"
                  className="h-9 w-9 rounded-xl border border-slate-200 shadow-sm object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Acesso Restrito</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

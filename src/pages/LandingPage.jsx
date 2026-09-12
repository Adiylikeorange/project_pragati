import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 font-sans">
      {/* Top Banner / Nav */}
      <header className="bg-[#0A2540] text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-heading font-bold text-2xl tracking-wider text-white">PRAGATI</span>
            <span className="text-[10px] uppercase text-slate-300 tracking-wider">
              National Infrastructure Monitoring & Risk Intelligence Platform
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-200 hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow-sm transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          Next-Gen AI Risk & Milestone Monitoring Pipeline Active
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Accelerating India's Mega Infrastructure with <span className="text-blue-700">Predictive Intelligence</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mb-10 leading-relaxed">
          PRAGATI delivers unified cross-ministry visibility, real-time risk classification, and machine-learning early warning signals across thousands of critical infrastructure projects.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/signup"
            className="px-6 py-3.5 bg-[#0A2540] hover:bg-[#12365a] text-white font-semibold rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            <span>Access Portal</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-300 shadow-sm transition-all"
          >
            Authorized Login
          </Link>
        </div>
      </section>

      {/* Metric Highlights */}
      <section className="bg-white border-y border-slate-200 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#0A2540]">2,140+</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Monitored Projects</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-blue-600">₹108.4 L Cr</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Capital Expenditure</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-amber-600">3-Tier</div>
            <div className="text-sm font-medium text-slate-500 mt-1">AI Risk Prediction</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-600">89.4%</div>
            <div className="text-sm font-medium text-slate-500 mt-1">On-Time Prediction Accuracy</div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Why Project PRAGATI?</h2>
          <p className="text-slate-600 mt-2 text-sm md:text-base">Modern cloud surveillance and proactive intervention before delays compound.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">analytics</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Centralized Dashboard</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Consolidated views of National Infrastructure Pipeline projects spanning transport, energy, water, urban, and telecom sectors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Early Warning Triggers</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time anomaly identification with Isolation Forest modeling to catch contractor stall, land acquisition disputes, and clearance bottlenecks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Enterprise Security & Roles</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Strict JWT-backed authentication, customized watchlist curation, personal notification thresholds, and role-based security.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 text-center text-xs border-t border-slate-800">
        <p>© {new Date().getFullYear()} PRAGATI — Infrastructure Risk & Monitoring Platform. Government of India.</p>
        <p className="mt-1 text-slate-500">Secure Production Environment • SIH 2026 Problem ID 26013</p>
      </footer>
    </div>
  );
}

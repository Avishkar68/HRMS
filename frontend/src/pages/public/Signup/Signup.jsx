import React from "react";
import { Link } from "react-router-dom";
import { Mail, Star, ChevronLeft, UserCheck } from "lucide-react";

const Signup = () => {
  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans">
      
      {/* LEFT COLUMN: INFO CARD */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-[#f8fafd] relative z-10">
        
        {/* Header Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-[#303f9f] flex items-center">
              the <span className="text-[#3b82f6] font-extrabold ml-1">workspace</span>
              <span className="text-xs text-[#64748b] align-super font-medium ml-0.5">.app</span>
            </span>
          </Link>
        </div>

        {/* Info Card Container */}
        <div className="max-w-md w-full mx-auto my-auto py-12 text-center sm:text-left">
          
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#3b82f6] mb-6">
            <UserCheck className="w-6 h-6" />
          </div>

          <h2 className="text-3xl font-black text-[#1e293b] leading-tight tracking-tight">
            Create an Account
          </h2>
          
          <p className="mt-4 text-sm text-[#64748b] leading-relaxed">
            Employee and manager accounts are created and provisioned by your company's system administrator. 
            This ensures data isolation, secure authentication, and proper reporting structures.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-[#3b82f6] text-left font-medium leading-relaxed">
            <strong>Need access?</strong> Please contact your company's HR manager or IT support desk to request your login credentials and activation email.
          </div>

          <div className="mt-8">
            <Link 
              to="/signin" 
              className="inline-flex items-center justify-center space-x-2 w-full sm:w-auto bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-3.5 px-8 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:translate-y-0 hover:-translate-y-0.5 transition-all text-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>

        </div>

        {/* Footer Credit */}
        <div className="text-left text-[10px] text-[#94a3b8]">
          <p>© {new Date().getFullYear()} Workspace HRMS Platform. Secure single sign-on portal.</p>
        </div>

      </div>

      {/* RIGHT COLUMN: TEAM PHOTO BANNER */}
      <div className="hidden lg:flex w-1/2 p-6 bg-[#f1f5f9] items-center justify-center h-screen overflow-hidden">
        <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-300">
          
          {/* Main Visual Image */}
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" 
            alt="Collaborative HR Team" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          {/* Testimonial Quote Overlay */}
          <div className="absolute bottom-8 left-8 right-8 z-10 space-y-4">
            
            {/* Top Avatar Row */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3.5">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  alt="Cheri Charles" 
                  className="w-11 h-11 rounded-full object-cover border border-white/20"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">Cheri Charles</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">HR Operations Admin</p>
                </div>
              </div>
              <div className="flex space-x-0.5 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
            </div>

            {/* Testimonial Message */}
            <div className="bg-white text-slate-700 p-5 rounded-2xl shadow-xl space-y-2 border border-slate-100/10">
              <span className="text-3xl text-blue-500 font-serif leading-none block h-2">“</span>
              <p className="text-xs sm:text-sm font-medium leading-relaxed italic text-slate-600">
                The onboarding pipeline is secure and robust. Our new company accounts are isolated, giving us complete control over manager designations and division allocations.
              </p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Signup;

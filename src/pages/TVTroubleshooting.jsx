import { Monitor, Cable, RotateCcw, Wrench } from "lucide-react";
import React from "react";

const RemoteIcon = () => (
  <svg className="w-16 h-16 text-[#4482a9]" viewBox="0 0 100 100" fill="currentColor">
    <rect x="30" y="15" width="40" height="70" rx="8" fill="currentColor"/>
    <circle cx="45" cy="30" r="3" fill="white"/>
    <circle cx="55" cy="30" r="3" fill="white"/>
    <rect x="35" y="40" width="30" height="8" rx="4" fill="white"/>
    <circle cx="40" cy="55" r="2.5" fill="white"/>
    <circle cx="50" cy="55" r="2.5" fill="white"/>
    <circle cx="60" cy="55" r="2.5" fill="white"/>
    <circle cx="40" cy="65" r="2.5" fill="white"/>
    <circle cx="50" cy="65" r="2.5" fill="white"/>
    <circle cx="60" cy="65" r="2.5" fill="white"/>
    <circle cx="40" cy="75" r="2.5" fill="white"/>
    <circle cx="50" cy="75" r="2.5" fill="white"/>
    <circle cx="60" cy="75" r="2.5" fill="white"/>
  </svg>
);

const TVIcon = () => (
  <svg className="w-20 h-20 text-[#4482a9]" viewBox="0 0 100 100" fill="currentColor">
    <rect x="15" y="20" width="70" height="50" rx="6" fill="currentColor"/>
    <rect x="20" y="25" width="60" height="35" rx="2" fill="white"/>
    <rect x="40" y="70" width="20" height="3" fill="currentColor"/>
    <rect x="35" y="73" width="30" height="4" rx="2" fill="currentColor"/>
  </svg>
);

const RestartIcon = () => (
  <svg className="w-16 h-16 text-[#4482a9]" viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 15 A35 35 0 1 1 25 40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <polygon points="45,10 55,20 45,30" fill="currentColor"/>
    <rect x="35" y="45" width="8" height="12" rx="2" fill="currentColor"/>
    <rect x="45" y="40" width="6" height="8" rx="2" fill="currentColor"/>
  </svg>
);

export default function TVTroubleshooting() {
  const troubleshootingSteps = [
    {
      number: 1,
      title: "Check power",
      icon: <TVIcon />
    },
    {
      number: 2,
      title: "Inspect remote",
      icon: <RemoteIcon />
    },
    {
      number: 3,
      title: "Verify input source",
      icon: <Cable className="w-16 h-16 text-[#4482a9]" />
    },
    {
      number: 4,
      title: "Restart the TV",
      icon: <RestartIcon />
    },
    {
      number: 5,
      title: "Contact support",
      icon: <Wrench className="w-16 h-16 text-[#4482a9]" />
    }
  ];

  return (
    <div className="max-w-lg mx-auto p-8 bg-[#ebf0f3] min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="bg-[#4482a9] rounded-2xl p-6 text-center shadow-lg">
          <h1 className="text-3xl font-bold text-white">TV Troubleshooting</h1>
        </div>
      </div>

      {/* Troubleshooting Steps */}
      <div className="space-y-8">
        {troubleshootingSteps.map((step, index) => (
          <div key={index} className="flex bg-white h-[8rem] px-6 items-center gap-6 rounded-2xl shadow-sm">
            {/* Number Circle */}
            <div className="flex-shrink-0 w-16 h-16 bg-[#4482a9] rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">{step.number}</span>
            </div>
            
            {/* Title */}
           {step.number==2 || step.number==4?<>
          
            
            {/* Icon */}
            <div className="flex-shrink-0">
              {step.icon}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-medium text-gray-700">{step.title}</h2>
            </div>
           </>:<>
           <div className="flex-1">
              <h2 className="text-2xl font-medium text-gray-700">{step.title}</h2>
            </div>
            
            {/* Icon */}
            <div className="flex-shrink-0">
              {step.icon}
            </div>
           </>}
          </div>
        ))}
      </div>
    </div>
  );
}
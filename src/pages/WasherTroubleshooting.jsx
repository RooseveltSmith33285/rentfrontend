import { Plug, CheckSquare, Droplets, RotateCcw } from "lucide-react";
import React from "react";
const WasherIcon = () => (
  <svg className="w-16 h-16 text-white" viewBox="0 0 100 100" fill="currentColor">
    <rect x="15" y="15" width="70" height="70" rx="8" fill="currentColor"/>
    <rect x="20" y="20" width="60" height="8" rx="4" fill="white" opacity="0.3"/>
    <circle cx="30" cy="35" r="3" fill="white"/>
    <circle cx="40" cy="35" r="3" fill="white"/>
    <circle cx="50" cy="55" r="20" fill="none" stroke="white" strokeWidth="3"/>
    <path d="M45 50 Q50 45 55 50 Q50 55 45 50" fill="white"/>
  </svg>
);

const DrainHoseIcon = () => (
  <svg className="w-8 h-8 text-[#044869]" viewBox="0 0 100 100" fill="currentColor">
    <path d="M20 40 Q30 20 50 40 Q70 60 80 40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    <rect x="15" y="35" width="10" height="10" rx="2"/>
    <rect x="75" y="35" width="10" height="10" rx="2"/>
  </svg>
);

export default function WasherTroubleshooting() {
  const troubleshootingSteps = [
    {
      number: 1,
      title: "CHECK POWER",
      description: "Confirm outlet, breaker, and power cord are intact.",
      icon: <Plug className="w-8 h-8 text-[#044869]" />
    },
    {
      number: 2,
      title: "INSPECT DOOR/LID SWITCH",
      description: "Ensure door is closed fully; many washers won't start otherwise.",
      icon: <CheckSquare className="w-8 h-8 text-[#044869]" />
    },
    {
      number: 3,
      title: "VERIFY WATER SUPPLY",
      description: "Make sure hot/cold valves are open, hoses aren't kinked.",
      icon: <Droplets className="w-8 h-8 text-[#044869]" />
    },
    {
      number: 4,
      title: "CHECK DRAIN HOSE/FILTER",
      description: "Clean lint trap or pump filter; straighten hose for proper draining.",
      icon: <DrainHoseIcon className="w-8 h-8 text-[#044869]"/>
    },
    {
      number: 5,
      title: "RESET CYCLE",
      description: "Unplug for 5 minutes, plug back in, run a short test cycle",
      icon: <RotateCcw className="w-8 h-8 text-[#044869]" />
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#e2f4f8] from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center mx-[1rem] justify-center gap-4 mb-6">
          <div className="bg-[#074a6d] p-4 rounded-2xl shadow-lg">
            <WasherIcon />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-[#074a6d] mb-2">WASHER</h1>
            <h2 className="text-3xl font-bold text-[#074a6d]">TROUBLESHOOTING</h2>
            <p className="text-[#074a6d] text-lg leading-relaxed">
            <span className="font-semibold">Common problems:</span> won't start, 
            won't drain, excessive vibration, not filling, bad odors
          </p>
          </div>
        </div>
        
        
      </div>

      {/* Troubleshooting Steps */}
      <div className="space-y-6">
        {troubleshootingSteps.map((step, index) => (
          <div key={index} className="rounded-xl  hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="flex items-start p-6">
              {/* Icon Circle */}
              <div className="flex-shrink-0 w-16 h-16 border-2 border-[#044869] rounded-full flex items-center justify-center mr-6 shadow-lg">
  {step.icon}
</div>

              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#044869] mb-2 flex items-center gap-3">
                  <span className="text-[#044869]">{step.number}.</span>
                  {step.title}
                </h3>
                <p className="text-[#044869] leading-relaxed text-lg">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      
    </div>
  );
}
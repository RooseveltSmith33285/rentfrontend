import React from 'react';

export default function DryerTroubleshooting() {
  const troubleshootingSteps = [
    {
      step: 1,
      title: "CHECK POWER",
      description: "Verify breaker (240V for electric dryers) or gas supply (for gas dryers).",
      icon: "power"
    },
    {
      step: 2,
      title: "CLEAN LINT FILTER",
      description: "Remove lint buildup for airflow.",
      icon: "filter"
    },
    {
      step: 3,
      title: "INSPECT VENT HOSE",
      description: "Ensure it's not crushed or clogged with lint.",
      icon: "vent"
    },
    {
      step: 4,
      title: "TEST DOOR SWITCH",
      description: "Dryer won't run if door switch is faulty or not engaging.",
      icon: "switch"
    },
    {
      step: 5,
      title: "RUN TIMED DRY",
      description: "If still not heating, problem may be heating element, thermostat, or igniter (needs service)",
      icon: "timer"
    }
  ];

  const DryerIcon = () => (
    <div className="w-32 h-32 mx-auto mb-8">
      <div className="relative w-full h-full bg-white border-4 border-gray-700 rounded-lg">
       
        <div className="absolute top-2 left-2 right-2 h-6 bg-gray-100 border-b-2 border-gray-700 flex items-center">
          <div className="ml-2 w-8 h-2 bg-gray-400 rounded"></div>
          <div className="ml-auto mr-2 w-4 h-4 border-2 border-gray-600 rounded-full bg-gray-200"></div>
        </div>
        
       
        <div className="absolute top-10 left-4 right-4 bottom-4 border-3 border-gray-700 rounded-full bg-gray-50">
        
          <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-gray-600 rounded-full bg-white">
        
            <div className="absolute top-1/2 left-1 w-2 h-6 bg-gray-400 rounded transform -translate-y-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const PowerIcon = () => (
    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  );

  const FilterIcon = () => (
    <div className="w-8 h-8 border-2 border-gray-700 rounded bg-gray-100 relative">
     
      <div className="absolute top-1 left-1 w-1 h-1 bg-gray-600 rounded-full"></div>
      <div className="absolute top-2 left-3 w-1 h-1 bg-gray-600 rounded-full"></div>
      <div className="absolute top-3 left-1 w-1 h-1 bg-gray-600 rounded-full"></div>
      <div className="absolute top-1 left-5 w-1 h-1 bg-gray-600 rounded-full"></div>
      <div className="absolute top-4 left-4 w-1 h-1 bg-gray-600 rounded-full"></div>
      <div className="absolute top-3 left-5 w-1 h-1 bg-gray-600 rounded-full"></div>
      <div className="absolute top-5 left-2 w-1 h-1 bg-gray-600 rounded-full"></div>
      <div className="absolute top-5 left-5 w-1 h-1 bg-gray-600 rounded-full"></div>
    </div>
  );

  const VentIcon = () => (
    <div className="relative">
      <div className="w-8 h-6 border-2 border-gray-700 rounded-r-full bg-gray-100"></div>
      <div className="absolute top-1 left-1 w-2 h-1 bg-gray-500 rounded"></div>
      <div className="absolute top-2 left-1 w-3 h-1 bg-gray-500 rounded"></div>
      <div className="absolute top-3 left-1 w-2 h-1 bg-gray-500 rounded"></div>
    </div>
  );

  const SwitchIcon = () => (
    <div className="w-8 h-8 border-2 border-gray-700 rounded-full bg-gray-100 relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-gray-600 rounded"></div>
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-800 rounded"></div>
    </div>
  );

  const TimerIcon = () => (
    <div className="w-8 h-8 border-2 border-gray-700 rounded-full bg-gray-100 relative">
      <div className="absolute top-1/2 left-1/2 w-3 h-px bg-gray-700 transform -translate-y-1/2 origin-left"></div>
      <div className="absolute top-2 left-1/2 w-px h-2 bg-gray-700 transform -translate-x-1/2 origin-bottom"></div>
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-gray-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
    </div>
  );

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'power':
        return <PowerIcon />;
      case 'filter':
        return <FilterIcon />;
      case 'vent':
        return <VentIcon />;
      case 'switch':
        return <SwitchIcon />;
      case 'timer':
        return <TimerIcon />;
      default:
        return <PowerIcon />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ece0] p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
       
        <div className="bg-[#e26c44] text-[#efebe4] rounded-2xl py-8 px-6 mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
            DRYER<br />
            TROUBLESHOOTING
          </h1>
        </div>

     
        <DryerIcon />

      
        <div className="w-full h-1 bg-gray-400 mb-8"></div>

        <div className="space-y-6">
          {troubleshootingSteps.map((step, index) => (
            <div key={step.step}>
              <div className="flex items-start gap-6">
           
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#e26c44] text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {step.step}
                  </div>
                </div>

           
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    {step.title}
                  </h2>
                  <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12">
                  {getIcon(step.icon)}
                </div>
              </div>

             
              {index < troubleshootingSteps.length - 1 && (
                <div className="w-full h-px bg-gray-400 my-6"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
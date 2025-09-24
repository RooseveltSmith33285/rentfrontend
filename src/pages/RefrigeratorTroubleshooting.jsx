import React from 'react';

export default function RefrigeratorTroubleshooting() {
  const troubleshootingSteps = [
    {
      step: 1,
      title: "CHECK POWER SUPPLY",
      icon: "power"
    },
    {
      step: 2,
      title: "ADJUST TEMPERATURE SETTINGS",
      icon: "temperature"
    },
    {
      step: 3,
      title: "CLEAN THE CONDENSER COILS",
      icon: "condenser"
    },
    {
      step: 4,
      title: "INSPECT THE DOOR SEALS",
      icon: "refrigerator"
    },
    {
      step: 5,
      title: "CHECK FOR BLOCKED VENTS",
      icon: "vents"
    }
  ];

  const PowerIcon = () => (
    <div className="w-16 h-16 flex items-center justify-center">
      <svg className="w-12 h-12 text-teal-800" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 7h10v1H7zm0 2h10v1H7zm0 2h7v1H7z"/>
        <path d="M6 4.5c0-.83.67-1.5 1.5-1.5h9c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5H10l-4 3v-3H7.5c-.83 0-1.5-.67-1.5-1.5v-11z"/>
        <rect x="9" y="13" width="6" height="3" rx="1"/>
        <rect x="8" y="14" width="2" height="1"/>
      </svg>
    </div>
  );

  const TemperatureIcon = () => (
    <div className="w-16 h-16 flex items-center justify-center">
      <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v1h-1v1h1v1h-1v1h1v1h-1v1h1v.5c-.36-.33-.8-.5-1.25-.5-.45 0-.89.17-1.25.5V5z"/>
      </svg>
    </div>
  );

  const CondenserIcon = () => (
    <div className="w-16 h-16 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-10 bg-teal-700 rounded grid grid-cols-4 gap-1 p-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-teal-900 rounded-sm"></div>
          ))}
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <div className="w-2 h-2 bg-orange-500 rounded transform rotate-45"></div>
          <div className="absolute top-1 left-1 w-1 h-1 bg-orange-600 rounded transform rotate-45"></div>
        </div>
      </div>
    </div>
  );

  const RefrigeratorIcon = () => (
    <div className="w-16 h-16 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-14 bg-blue-300 border-2 border-teal-700 rounded-lg">
          <div className="absolute top-1 left-1 w-1 h-3 bg-teal-600 rounded"></div>
          <div className="absolute top-1 right-1 w-1 h-3 bg-teal-600 rounded"></div>
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-px bg-teal-600"></div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-px bg-teal-600"></div>
        </div>
      </div>
    </div>
  );

  const VentsIcon = () => (
    <div className="w-16 h-16 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-14 bg-blue-300 border-2 border-teal-700 rounded-lg">
          <div className="absolute top-1 left-1 w-1 h-3 bg-teal-600 rounded"></div>
          <div className="absolute top-1 right-1 w-1 h-3 bg-teal-600 rounded"></div>
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-px bg-teal-600"></div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-px bg-teal-600"></div>
        </div>
      </div>
    </div>
  );

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'power':
        return <PowerIcon />;
      case 'temperature':
        return <TemperatureIcon />;
      case 'condenser':
        return <CondenserIcon />;
      case 'refrigerator':
        return <RefrigeratorIcon />;
      case 'vents':
        return <VentsIcon />;
      default:
        return <PowerIcon />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f1e6]">
      {/* Header */}
      <div className="bg-[#f9f1e6] py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#143d5f] leading-tight">
            Refrigerator<br />
            Troubleshooting
          </h1>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 md:px-8">
        <div className="space-y-6">
          {troubleshootingSteps.map((step, index) => (
            <div key={step.step} className="bg-[#fefbf4] rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#e88c4d] text-white rounded-full flex items-center justify-center font-bold text-2xl">
                    {step.step}
                  </div>
                </div>

                {/* Title */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-800 leading-tight">
                    {step.title}
                  </h2>
                </div>

                {/* Icon */}
                <div className="flex-shrink-0 flex justify-center">
                  {getIcon(step.icon)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-[#183d58] h-20 mt-12"></div>
    </div>
  );
}
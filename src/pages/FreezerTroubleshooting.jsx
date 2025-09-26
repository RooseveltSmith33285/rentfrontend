import React from 'react';

export default function FreezerTroubleshooting() {
  const troubleshootingSteps = [
    {
      step: 1,
      title: "Check power supply",
      icon: "power"
    },
    {
      step: 2,
      title: "Inspect door seal",
      icon: "door"
    },
    {
      step: 3,
      title: "Adjust temperature setting",
      icon: "temperature"
    },
    {
      step: 4,
      title: "Ensure proper airflow",
      icon: "airflow"
    },
    {
      step: 5,
      title: "Contact a technician",
      icon: "technician"
    }
  ];

  const PowerIcon = () => (
    <div className="w-16 h-16 bg-[#318391] rounded-full flex items-center justify-center border-4 border-teal-800">
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 7h10v1H7zm0 2h10v1H7zm0 2h7v1H7z"/>
        <path d="M6 4.5c0-.83.67-1.5 1.5-1.5h9c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5H10l-4 3v-3H7.5c-.83 0-1.5-.67-1.5-1.5v-11z"/>
        <rect x="9" y="13" width="6" height="3" rx="1"/>
        <rect x="8" y="14" width="2" height="1"/>
      </svg>
    </div>
  );

  const DoorIcon = () => (
    <div className="w-16 h-16 bg-white rounded-lg border-4 border-teal-800 flex items-center justify-center relative">
      <div className="w-10 h-12 bg-gray-100 border-2 border-[#318391] rounded">
        <div className="absolute left-2 top-1/2 w-1 h-3 bg-[#318391] rounded"></div>
        <div className="absolute right-2 top-1/2 w-1 h-3 bg-[#318391] rounded"></div>
        <div className="absolute left-1/2 top-6 transform -translate-x-1/2 w-6 h-px bg-[#318391]"></div>
      </div>
    </div>
  );

  const TemperatureIcon = () => (
    <div className="w-16 h-16 bg-white rounded-full border-4 border-teal-800 flex items-center justify-center">
      <div className="relative">
        <div className="w-3 h-8 bg-[#318391] rounded-t-full"></div>
        <div className="w-6 h-6 bg-[#318391] rounded-full -mt-1 -ml-1.5 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <svg className="absolute -top-2 -right-3 w-4 h-4 text-[#318391]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3 6h-2v3h-2V8H9l3-6z"/>
          <circle cx="12" cy="16" r="2"/>
          <path d="m8 12 1.5 1.5L8 15l1.5 1.5L8 18l1.5 1.5"/>
          <path d="m16 12-1.5 1.5L16 15l-1.5 1.5L16 18l-1.5 1.5"/>
        </svg>
      </div>
    </div>
  );

  const AirflowIcon = () => (
    <div className="w-16 h-16 bg-white rounded-full border-4 border-teal-800 flex items-center justify-center">
      <div className="relative">
        <div className="w-8 h-8 border-2 border-[#318391] rounded-full flex items-center justify-center">
          <div className="relative w-6 h-6">
            <div className="absolute top-0 left-1/2 w-1 h-3 bg-[#318391] rounded origin-bottom transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 right-0 w-3 h-1 bg-[#318391] rounded origin-left transform -translate-y-1/2 rotate-90"></div>
            <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-[#318391] rounded origin-top transform -translate-x-1/2 rotate-180"></div>
            <div className="absolute top-1/2 left-0 w-3 h-1 bg-[#318391] rounded origin-right transform -translate-y-1/2 -rotate-90"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const TechnicianIcon = () => (
    <div className="w-16 h-16 bg-[#318391] rounded-full border-4 border-teal-800 flex items-center justify-center">
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
      </svg>
    </div>
  );

  const ArrowIcon = () => (
    <div className="flex justify-center my-4">
      <svg className="w-8 h-8 text-[#318391]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
      </svg>
    </div>
  );

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'power':
        return <PowerIcon />;
      case 'door':
        return <DoorIcon />;
      case 'temperature':
        return <TemperatureIcon />;
      case 'airflow':
        return <AirflowIcon />;
      case 'technician':
        return <TechnicianIcon />;
      default:
        return <PowerIcon />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      <div className="bg-[#318391] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Freezer Troubleshooting
          </h1>
        </div>
      </div>

  
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 md:px-8">
        <div className="space-y-8">
          {troubleshootingSteps.map((step, index) => (
            <div key={step.step}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
             
                <div className="flex-shrink-0">
                  <div className="bg-[#318391] text-white px-6 py-3 rounded-tl-lg  font-bold text-xl w-32 text-center">
                    STEP {step.step}
                  </div>
                </div>

              
                <div className="flex-shrink-0 flex justify-center">
                  {getIcon(step.icon)}
                </div>

              
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-900 leading-tight">
                    {step.title}
                  </h2>
                </div>
              </div>

         
              {index < troubleshootingSteps.length - 1 && <ArrowIcon />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
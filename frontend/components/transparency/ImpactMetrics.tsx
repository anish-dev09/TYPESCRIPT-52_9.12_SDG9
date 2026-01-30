import React from 'react';

interface ImpactData {
  infrastructure: {
    roadsBuilt: number; // in kilometers
    bridgesCompleted: number;
    schoolsPowered: number;
    hospitalsPowered: number;
    waterSupplyProjects: number;
  };
  social: {
    livesImpacted: number;
    jobsCreated: number;
    communitiesServed: number;
    dailyBeneficiaries: number;
  };
  environmental: {
    carbonFootprintReduction: number; // in tons CO2
    renewableEnergyMW: number;
    treesPlanted: number;
    wasteReduced: number; // in tons
  };
  sdgAlignment: {
    sdg9Score: number; // 0-100
    sdg11Score: number; // Sustainable Cities
    sdg13Score: number; // Climate Action
    sdg7Score: number; // Affordable Clean Energy
  };
}

interface ImpactMetricsProps {
  data: ImpactData;
  projectName: string;
}

export default function ImpactMetrics({ data, projectName }: ImpactMetricsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const impactCards = [
    {
      category: 'Infrastructure Impact',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      metrics: [
        { label: 'Roads Built', value: `${data.infrastructure.roadsBuilt} km`, icon: '🛣️' },
        { label: 'Bridges Completed', value: data.infrastructure.bridgesCompleted, icon: '🌉' },
        { label: 'Schools Powered', value: data.infrastructure.schoolsPowered, icon: '🏫' },
        { label: 'Hospitals Powered', value: data.infrastructure.hospitalsPowered, icon: '🏥' },
        { label: 'Water Projects', value: data.infrastructure.waterSupplyProjects, icon: '💧' },
      ],
    },
    {
      category: 'Social Impact',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      metrics: [
        { label: 'Lives Impacted', value: formatNumber(data.social.livesImpacted), icon: '👥' },
        { label: 'Jobs Created', value: formatNumber(data.social.jobsCreated), icon: '💼' },
        { label: 'Communities Served', value: data.social.communitiesServed, icon: '🏘️' },
        { label: 'Daily Beneficiaries', value: formatNumber(data.social.dailyBeneficiaries), icon: '✨' },
      ],
    },
    {
      category: 'Environmental Impact',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
        </svg>
      ),
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      metrics: [
        { label: 'CO₂ Reduction', value: `${formatNumber(data.environmental.carbonFootprintReduction)} tons`, icon: '🌍' },
        { label: 'Renewable Energy', value: `${data.environmental.renewableEnergyMW} MW`, icon: '⚡' },
        { label: 'Trees Planted', value: formatNumber(data.environmental.treesPlanted), icon: '🌳' },
        { label: 'Waste Reduced', value: `${formatNumber(data.environmental.wasteReduced)} tons`, icon: '♻️' },
      ],
    },
  ];

  const sdgGoals = [
    {
      number: 9,
      name: 'Industry, Innovation & Infrastructure',
      score: data.sdgAlignment.sdg9Score,
      color: 'from-orange-500 to-orange-600',
      icon: '🏗️',
    },
    {
      number: 11,
      name: 'Sustainable Cities & Communities',
      score: data.sdgAlignment.sdg11Score,
      color: 'from-yellow-500 to-yellow-600',
      icon: '🏙️',
    },
    {
      number: 13,
      name: 'Climate Action',
      score: data.sdgAlignment.sdg13Score,
      color: 'from-green-500 to-green-600',
      icon: '🌡️',
    },
    {
      number: 7,
      name: 'Affordable & Clean Energy',
      score: data.sdgAlignment.sdg7Score,
      color: 'from-yellow-400 to-yellow-500',
      icon: '💡',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Real-World Impact Metrics</h2>
        <p className="text-gray-600">Measuring tangible outcomes of {projectName}</p>
      </div>

      {/* Impact Cards */}
      <div className="space-y-6 mb-8">
        {impactCards.map((card) => (
          <div key={card.category} className={`${card.bgColor} rounded-lg p-6 border-2 border-gray-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{card.category}</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {card.metrics.map((metric) => (
                <div key={metric.label} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{metric.icon}</span>
                    <span className="text-xs text-gray-500">{metric.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SDG Alignment */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">UN Sustainable Development Goals Alignment</h3>
            <p className="text-sm text-gray-600">Contributing to global sustainability targets</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {sdgGoals.map((goal) => (
            <div key={goal.number} className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{goal.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">
                        SDG {goal.number}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{goal.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{goal.score}%</p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>

              {/* Score Bar */}
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${goal.color} transition-all duration-500`}
                  {...({ style: { width: `${goal.score}%` } } as any)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Impact Summary */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <svg className="w-10 h-10 mb-3 opacity-80" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <p className="text-3xl font-bold mb-2">{formatNumber(data.social.livesImpacted)}</p>
          <p className="text-sm opacity-90">Total Lives Impacted</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <svg className="w-10 h-10 mb-3 opacity-80" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          <p className="text-3xl font-bold mb-2">{formatNumber(data.environmental.carbonFootprintReduction)}</p>
          <p className="text-sm opacity-90">Tons CO₂ Reduced</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <svg className="w-10 h-10 mb-3 opacity-80" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          <p className="text-3xl font-bold mb-2">{data.infrastructure.roadsBuilt}</p>
          <p className="text-sm opacity-90">Kilometers of Roads Built</p>
        </div>
      </div>

      {/* Certification Badge */}
      <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-8 h-8 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div>
            <p className="font-bold text-yellow-900 mb-1">
              🎯 Verified Impact Certification
            </p>
            <p className="text-sm text-yellow-800">
              All impact metrics are independently verified by third-party auditors and tracked through IoT sensors and satellite imagery. Impact data is updated monthly and published on the blockchain for complete transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

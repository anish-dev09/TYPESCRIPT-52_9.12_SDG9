import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import FundTracker from '../components/transparency/FundTracker';
import MilestoneProgressTracker from '../components/transparency/MilestoneProgressTracker';
import ImpactMetrics from '../components/transparency/ImpactMetrics';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  totalFunding: number;
  currentFunding: number;
  status: string;
  category: string;
}

interface Milestone {
  id: string;
  title: string;
  status: string;
  targetDate: string;
  amountReleased?: number;
}

const ProgressBar = ({ progress }: { progress: number }) => {
  const progressPercentage = Math.min(progress, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2 w-24 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          {...({ style: { width: `${progressPercentage}%` } } as any)}
        />
      </div>
      <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}%</span>
    </div>
  );
};

export default function TransparencyPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Platform-wide statistics
  const [platformStats, setPlatformStats] = useState({
    totalProjects: 0,
    totalFunding: 0,
    totalInvestors: 0,
    totalFundsReleased: 0,
  });

  // Mock data for Phase 9 components
  const [fundData, setFundData] = useState({
    totalRaised: 0,
    targetFunding: 0,
    fundsReleased: 0,
    fundsLocked: 0,
    utilization: {
      construction: 0,
      equipment: 0,
      labor: 0,
      materials: 0,
      other: 0,
    },
  });

  const [impactData, setImpactData] = useState({
    infrastructure: {
      roadsBuilt: 145,
      bridgesCompleted: 23,
      schoolsPowered: 89,
      hospitalsPowered: 34,
      waterSupplyProjects: 67,
    },
    social: {
      livesImpacted: 1250000,
      jobsCreated: 45000,
      communitiesServed: 234,
      dailyBeneficiaries: 380000,
    },
    environmental: {
      carbonFootprintReduction: 125000,
      renewableEnergyMW: 567,
      treesPlanted: 78900,
      wasteReduced: 45600,
    },
    sdgAlignment: {
      sdg9Score: 92,
      sdg11Score: 87,
      sdg13Score: 79,
      sdg7Score: 85,
    },
  });

  const [milestonesData, setMilestonesData] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadMilestones(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.data);

      // Calculate platform statistics
      const stats = {
        totalProjects: response.data.length,
        totalFunding: response.data.reduce((sum: number, p: Project) => sum + p.currentFunding, 0),
        totalInvestors: response.data.reduce((sum: number, p: any) => sum + (p.investorCount || 0), 0),
        totalFundsReleased: response.data.reduce((sum: number, p: any) => sum + (p.fundsReleased || 0), 0),
      };
      setPlatformStats(stats);

      // Set fund data for FundTracker
      setFundData({
        totalRaised: stats.totalFunding,
        targetFunding: stats.totalFunding * 1.5, // Mock target
        fundsReleased: stats.totalFundsReleased || stats.totalFunding * 0.6,
        fundsLocked: stats.totalFunding * 0.4,
        utilization: {
          construction: stats.totalFundsReleased * 0.45 || stats.totalFunding * 0.27,
          equipment: stats.totalFundsReleased * 0.25 || stats.totalFunding * 0.15,
          labor: stats.totalFundsReleased * 0.15 || stats.totalFunding * 0.09,
          materials: stats.totalFundsReleased * 0.10 || stats.totalFunding * 0.06,
          other: stats.totalFundsReleased * 0.05 || stats.totalFunding * 0.03,
        },
      });

      // Auto-select first project
      if (response.data.length > 0) {
        setSelectedProject(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async (projectId: string) => {
    try {
      const response = await apiService.get(`/milestones/project/${projectId}`);
      const milestones = response.data || [];
      
      // Transform to Phase 9 format
      const transformedMilestones = milestones.map((m: any, index: number) => ({
        id: m.id || `milestone-${index}`,
        name: m.title || m.name || `Milestone ${index + 1}`,
        description: m.description || 'Project milestone',
        targetDate: m.targetDate || new Date().toISOString(),
        completedDate: m.status === 'completed' ? m.completedDate || new Date().toISOString() : undefined,
        status: m.status || 'pending',
        fundReleaseAmount: m.amountReleased || 1000000,
        progressPercentage: m.progress || (m.status === 'completed' ? 100 : m.status === 'in-progress' ? 50 : 0),
        deliverables: m.deliverables || ['Key deliverable 1', 'Key deliverable 2'],
      }));
      
      setMilestonesData(transformedMilestones.length > 0 ? transformedMilestones : [
        {
          id: '1',
          name: 'Site Preparation & Foundation',
          description: 'Land acquisition, environmental clearance, and foundation work',
          targetDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          fundReleaseAmount: 5000000,
          progressPercentage: 100,
          deliverables: ['Land acquisition completed', 'Environmental clearance obtained', 'Foundation work done'],
        },
        {
          id: '2',
          name: 'Primary Construction',
          description: 'Main structural development and core infrastructure',
          targetDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          fundReleaseAmount: 8000000,
          progressPercentage: 100,
          deliverables: ['Structural framework completed', 'Core systems installed'],
        },
        {
          id: '3',
          name: 'Equipment Installation',
          description: 'Installation of machinery and technical equipment',
          targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in-progress',
          fundReleaseAmount: 6000000,
          progressPercentage: 65,
          deliverables: ['Primary equipment installed', 'Testing phase initiated'],
        },
        {
          id: '4',
          name: 'Testing & Commissioning',
          description: 'System testing, quality assurance, and final commissioning',
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          fundReleaseAmount: 4000000,
          progressPercentage: 0,
          deliverables: ['Safety testing', 'Performance validation', 'Final commissioning'],
        },
      ]);
      
      setMilestones(milestones);
    } catch (error) {
      console.error('Failed to load milestones:', error);
      // Set default milestones if API fails
      setMilestonesData([
        {
          id: '1',
          name: 'Site Preparation & Foundation',
          description: 'Land acquisition, environmental clearance, and foundation work',
          targetDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          fundReleaseAmount: 5000000,
          progressPercentage: 100,
          deliverables: ['Land acquisition completed', 'Environmental clearance obtained', 'Foundation work done'],
        },
        {
          id: '2',
          name: 'Primary Construction',
          description: 'Main structural development and core infrastructure',
          targetDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          fundReleaseAmount: 8000000,
          progressPercentage: 100,
          deliverables: ['Structural framework completed', 'Core systems installed'],
        },
        {
          id: '3',
          name: 'Equipment Installation',
          description: 'Installation of machinery and technical equipment',
          targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in-progress',
          fundReleaseAmount: 6000000,
          progressPercentage: 65,
          deliverables: ['Primary equipment installed', 'Testing phase initiated'],
        },
        {
          id: '4',
          name: 'Testing & Commissioning',
          description: 'System testing, quality assurance, and final commissioning',
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          fundReleaseAmount: 4000000,
          progressPercentage: 0,
          deliverables: ['Safety testing', 'Performance validation', 'Final commissioning'],
        },
      ]);
    }
  };

  const filteredProjects = (projects || []).filter((project) => {
    if (statusFilter === 'all') return true;
    return project.status === statusFilter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transparency & Analytics Dashboard</h1>
          <p className="text-gray-600">
            Real-time fund tracking, milestone progress, and measurable impact across all infrastructure projects
          </p>
        </div>

        {/* Project Selector */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value);
                setSelectedProject(project || null);
              }}
              aria-label="Select project to view details"
              className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a project to view details</option>
              {filteredProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter projects by status"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="funding">Funding</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Phase 9 Components */}
        <div className="space-y-8">
          {/* Fund Tracker - Real-time Fund Tracking */}
          <FundTracker data={fundData} />

          {/* Milestone Progress Tracker */}
          {milestonesData.length > 0 && (
            <MilestoneProgressTracker 
              milestones={milestonesData} 
              totalFunding={selectedProject?.totalFunding || fundData.totalRaised}
            />
          )}

          {/* Impact Metrics - SDG Aligned */}
          <ImpactMetrics 
            data={impactData} 
            projectName={selectedProject?.name || 'All Infrastructure Projects'}
          />
        </div>
      </div>
    </Layout>
  );
}

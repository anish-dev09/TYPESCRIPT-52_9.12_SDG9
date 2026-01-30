import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import apiService from '@/services/apiService';
import { formatCurrency } from '@/services/tokenService';

export default function MilestonesPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectAndMilestones();
    }
  }, [id]);

  const loadProjectAndMilestones = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/projects/${id}`);
      const projectData = response.data;
      
      setProject(projectData);
      setMilestones(projectData.milestones || []);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (milestoneId: number, newStatus: string) => {
    try {
      await apiService.put(`/projects/${id}/milestones/${milestoneId}`, {
        status: newStatus,
      });
      
      setMilestones(prev =>
        prev.map(m => (m.id === milestoneId ? { ...m, status: newStatus } : m))
      );
      
      alert('Milestone status updated successfully!');
    } catch (error) {
      console.error('Failed to update milestone:', error);
      alert('Failed to update milestone status');
    }
  };

  const handleDeleteMilestone = async (milestoneId: number) => {
    if (!confirm('Are you sure you want to delete this milestone?')) {
      return;
    }

    try {
      await apiService.delete(`/projects/${id}/milestones/${milestoneId}`);
      setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      alert('Milestone deleted successfully!');
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      alert('Failed to delete milestone');
    }
  };

  const openEditModal = (milestone: any) => {
    setSelectedMilestone({ ...milestone });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedMilestone(null);
    setShowEditModal(false);
  };

  const handleSaveMilestone = async () => {
    if (!selectedMilestone) return;

    try {
      if (selectedMilestone.id) {
        // Update existing milestone
        await apiService.put(
          `/projects/${id}/milestones/${selectedMilestone.id}`,
          selectedMilestone
        );
        
        setMilestones(prev =>
          prev.map(m => (m.id === selectedMilestone.id ? selectedMilestone : m))
        );
        alert('Milestone updated successfully!');
      } else {
        // Create new milestone
        const response = await apiService.post(
          `/projects/${id}/milestones`,
          selectedMilestone
        );
        
        setMilestones(prev => [...prev, response.data]);
        alert('Milestone created successfully!');
      }
      
      closeEditModal();
    } catch (error) {
      console.error('Failed to save milestone:', error);
      alert('Failed to save milestone');
    }
  };

  const createNewMilestone = () => {
    setSelectedMilestone({
      title: '',
      description: '',
      targetDate: '',
      fundingRequired: '',
      status: 'pending',
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    if (!milestones.length) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return (completed / milestones.length) * 100;
  };

  if (loading) {
    return (
      <AdminLayout title="Manage Milestones">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading milestones...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout title="Manage Milestones">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Project not found</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Milestones - ${project.name}`}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600 mt-1">Manage project milestones and track progress</p>
              </div>
              <button
                onClick={() => router.push('/admin/projects')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back to Projects
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {milestones.filter(m => m.status === 'completed').length} / {milestones.length} Completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total Funding: {formatCurrency(project.fundingGoal)} | 
              Raised: {formatCurrency(project.currentFunding || 0)}
            </div>
            <button
              onClick={createNewMilestone}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Milestone
            </button>
          </div>

          {/* Milestones List */}
          {milestones.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No milestones have been added to this project yet.</p>
              <button
                onClick={createNewMilestone}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Milestone
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id || index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{milestone.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                          {milestone.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{milestone.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Target Date:</span>
                          <div className="font-medium">
                            {new Date(milestone.targetDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Funding Required:</span>
                          <div className="font-medium">{formatCurrency(milestone.fundingRequired)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Milestone #{index + 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openEditModal(milestone)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  {milestone.status !== 'completed' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <span className="text-sm text-gray-600 mr-2">Quick Status Update:</span>
                      {milestone.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(milestone.id, 'in_progress')}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Start Progress
                        </button>
                      )}
                      {(milestone.status === 'pending' || milestone.status === 'in_progress') && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(milestone.id, 'completed')}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(milestone.id, 'delayed')}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Mark Delayed
                          </button>
                        </>
                      )}
                      {milestone.status === 'delayed' && (
                        <button
                          onClick={() => handleUpdateStatus(milestone.id, 'in_progress')}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Resume Progress
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Edit/Create Modal */}
          {showEditModal && selectedMilestone && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedMilestone.id ? 'Edit Milestone' : 'Create New Milestone'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={selectedMilestone.title}
                      onChange={(e) =>
                        setSelectedMilestone({ ...selectedMilestone, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={selectedMilestone.description}
                      onChange={(e) =>
                        setSelectedMilestone({ ...selectedMilestone, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Date *
                      </label>
                      <input
                        type="date"
                        value={selectedMilestone.targetDate}
                        onChange={(e) =>
                          setSelectedMilestone({ ...selectedMilestone, targetDate: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Funding Required (USD) *
                      </label>
                      <input
                        type="number"
                        value={selectedMilestone.fundingRequired}
                        onChange={(e) =>
                          setSelectedMilestone({ ...selectedMilestone, fundingRequired: e.target.value })
                        }
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={selectedMilestone.status}
                      onChange={(e) =>
                        setSelectedMilestone({ ...selectedMilestone, status: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMilestone}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Milestone
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

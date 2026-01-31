import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import apiService from '@/services/apiService';

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    fundingGoal: '',
    category: '',
    location: '',
    impactMetrics: '',
    sdgGoals: [] as number[],
    milestones: [] as any[],
  });

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/projects/${id}`);
      const project = response.data;
      
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'draft',
        fundingGoal: project.fundingGoal?.toString() || '',
        category: project.category || '',
        location: project.location || '',
        impactMetrics: project.impactMetrics || '',
        sdgGoals: project.sdgGoals || [],
        milestones: project.milestones || [],
      });
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id, loadProject]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSDGToggle = (sdgNumber: number) => {
    setFormData(prev => ({
      ...prev,
      sdgGoals: prev.sdgGoals.includes(sdgNumber)
        ? prev.sdgGoals.filter(n => n !== sdgNumber)
        : [...prev.sdgGoals, sdgNumber],
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: '',
          description: '',
          targetDate: '',
          fundingRequired: '',
          status: 'pending',
        },
      ],
    }));
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.fundingGoal) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      await apiService.put(`/projects/${id}`, {
        ...formData,
        fundingGoal: parseFloat(formData.fundingGoal),
        milestones: formData.milestones.map(m => ({
          ...m,
          fundingRequired: parseFloat(m.fundingRequired || '0'),
        })),
      });
      
      alert('Project updated successfully!');
      router.push('/admin/projects');
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sdgGoals = [
    { number: 1, title: 'No Poverty' },
    { number: 2, title: 'Zero Hunger' },
    { number: 3, title: 'Good Health' },
    { number: 4, title: 'Quality Education' },
    { number: 5, title: 'Gender Equality' },
    { number: 6, title: 'Clean Water' },
    { number: 7, title: 'Affordable Energy' },
    { number: 8, title: 'Decent Work' },
    { number: 9, title: 'Industry & Innovation' },
    { number: 10, title: 'Reduced Inequalities' },
    { number: 11, title: 'Sustainable Cities' },
    { number: 12, title: 'Responsible Consumption' },
    { number: 13, title: 'Climate Action' },
    { number: 14, title: 'Life Below Water' },
    { number: 15, title: 'Life on Land' },
    { number: 16, title: 'Peace & Justice' },
    { number: 17, title: 'Partnerships' },
  ];

  if (loading) {
    return (
      <AdminLayout title="Edit Project">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading project...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Project">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600 mt-2">Update project details and milestones</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe the project in detail"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      title="Select project category"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="renewable_energy">Renewable Energy</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="water_sanitation">Water & Sanitation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      title="Select project status"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="funded">Funded</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Funding Goal (USD) *
                    </label>
                    <input
                      type="number"
                      name="fundingGoal"
                      value={formData.fundingGoal}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="Enter funding goal amount"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Impact Metrics
                  </label>
                  <textarea
                    name="impactMetrics"
                    value={formData.impactMetrics}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g., 1000 households powered, 50% reduction in emissions"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SDG Goals */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">SDG Alignment</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select the UN Sustainable Development Goals this project supports
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sdgGoals.map(sdg => (
                  <button
                    key={sdg.number}
                    type="button"
                    onClick={() => handleSDGToggle(sdg.number)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      formData.sdgGoals.includes(sdg.number)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">SDG {sdg.number}</div>
                    <div className="text-sm text-gray-600">{sdg.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Milestones</h2>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Milestone
                </button>
              </div>

              {formData.milestones.length === 0 ? (
                <p className="text-gray-500 text-center py-8 border-2 border-dashed rounded-lg">
                  No milestones added yet. Click &quot;Add Milestone&quot; to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">Milestone {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                            placeholder="Enter milestone title"
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                          </label>
                          <textarea
                            value={milestone.description}
                            onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                            rows={2}
                            placeholder="Describe the milestone"
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Target Date *
                            </label>
                            <input
                              type="date"
                              value={milestone.targetDate}
                              onChange={(e) => updateMilestone(index, 'targetDate', e.target.value)}
                              title="Select target date"
                              className="w-full px-3 py-2 border rounded-lg"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Funding Required *
                            </label>
                            <input
                              type="number"
                              value={milestone.fundingRequired}
                              onChange={(e) => updateMilestone(index, 'fundingRequired', e.target.value)}
                              min="0"
                              step="0.01"
                              placeholder="Enter amount"
                              className="w-full px-3 py-2 border rounded-lg"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status *
                            </label>
                            <select
                              value={milestone.status}
                              onChange={(e) => updateMilestone(index, 'status', e.target.value)}
                              title="Select milestone status"
                              className="w-full px-3 py-2 border rounded-lg"
                              required
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="delayed">Delayed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/admin/projects')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

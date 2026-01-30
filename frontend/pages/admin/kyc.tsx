import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import apiService from '@/services/apiService';
import toast from 'react-hot-toast';

export default function KYCApprovalsPage() {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKYCRequests();
  }, []);

  const loadKYCRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/users');
      // Filter users with pending KYC
      const pending = response.data?.filter((user: any) => user.kycStatus === 'pending') || [];
      setKycRequests(pending);
    } catch (error) {
      console.error('Failed to load KYC requests:', error);
      toast.error('Failed to load KYC requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKYC = async (userId: string) => {
    try {
      await apiService.put(`/kyc/${userId}/approve`);
      toast.success('KYC approved successfully');
      loadKYCRequests();
    } catch (error) {
      console.error('Failed to approve KYC:', error);
      toast.error('Failed to approve KYC');
    }
  };

  const handleRejectKYC = async (userId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    try {
      await apiService.put(`/kyc/${userId}/reject`, { reason });
      toast.success('KYC rejected');
      loadKYCRequests();
    } catch (error) {
      console.error('Failed to reject KYC:', error);
      toast.error('Failed to reject KYC');
    }
  };

  return (
    <AdminLayout title="KYC Approvals">
      <div className="space-y-6">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Pending KYC Requests</h2>
          <p className="text-4xl font-bold text-yellow-600">{kycRequests.length}</p>
        </div>

        {/* KYC Requests */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : kycRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-gray-500 text-lg">No pending KYC requests</p>
            </div>
          ) : (
            kycRequests.map((request: any) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {request.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{request.name || 'Unknown User'}</h3>
                        <p className="text-gray-600">{request.email}</p>
                        <p className="text-sm text-gray-500 font-mono">
                          {request.walletAddress ? `${request.walletAddress.slice(0, 10)}...${request.walletAddress.slice(-8)}` : 'No wallet'}
                        </p>
                      </div>
                    </div>

                    {/* KYC Documents */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Submitted Documents</h4>
                      {request.kycDocuments && Object.keys(request.kycDocuments).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(request.kycDocuments).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span className="text-sm text-gray-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No documents uploaded</p>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Role:</span>
                        <span className="ml-2 font-medium capitalize">{request.role}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Registered:</span>
                        <span className="ml-2 font-medium">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleApproveKYC(request.id)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectKYC(request.id)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

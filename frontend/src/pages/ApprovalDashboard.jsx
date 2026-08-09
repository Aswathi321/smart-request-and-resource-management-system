import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, ArrowRight, FileText, Eye, X, Clock } from 'lucide-react';

export default function ApprovalDashboard({ roleTitle }) {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Helper to convert standard Google Drive links to embeddable preview links
    const getEmbedUrl = (url) => {
        if (!url) return null;
        try {
            const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (fileIdMatch && fileIdMatch[1]) {
                const fileId = fileIdMatch[1];
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
            if (url.includes('drive.google.com/drive/folders/')) {
                 const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
                 if (match && match[1]) {
                     return url; 
                 }
            }
        } catch (e) {
            console.error('Error parsing drive URL', e);
        }
        return url;
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const { data } = await api.get('/requests/pending');
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch pending requests', error);
        } finally {
            setLoading(false);
        }
    };

    const processRequest = async (id, action) => {
        try {
            let payload = { action, remarks: `${action} by ${user.role}` };
            if (action === 'Approve' && user.role === 'Principal') {
                payload.digitalSignature = 'PRINCIPAL-SIG-101';
            } else if (action === 'Approve' && user.role === 'HOD') {
                payload.digitalSignature = 'HOD-SIG-102';
            }

            await api.put(`/requests/${id}/process`, payload);
            fetchPendingRequests();
        } catch (error) {
            console.error('Action failed', error);
            alert('Action failed: ' + error.response?.data?.message);
        }
    };

    if (loading) return (
        <div className="p-12 text-center text-surface-400 animate-fade-in">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading requests...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="gradient-header relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">{roleTitle} Dashboard</h2>
                        <p className="text-brand-100 mt-0.5">Review and process pending requests</p>
                    </div>
                </div>
                {requests.length > 0 && (
                    <div className="relative z-10 mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur rounded-lg text-sm font-semibold text-white">
                        <Clock className="w-4 h-4" />
                        {requests.length} pending
                    </div>
                )}
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-surface-300" />
                    </div>
                    <p className="text-surface-600 font-semibold mb-1">All caught up!</p>
                    <p className="text-surface-400 text-sm">No pending requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5">
                    {requests.map(req => (
                        <div key={req._id} className="bg-white rounded-2xl shadow-card border border-surface-100 hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-lg font-bold text-surface-900 truncate">{req.title}</h3>
                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 flex-shrink-0">
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="p-3 bg-surface-50 rounded-xl">
                                            <span className="block text-surface-400 text-xs font-medium mb-0.5">Student</span>
                                            <span className="font-semibold text-surface-800 text-sm">{req.requesterId?.name}</span>
                                        </div>
                                        <div className="p-3 bg-surface-50 rounded-xl">
                                            <span className="block text-surface-400 text-xs font-medium mb-0.5">Admission No</span>
                                            <span className="font-semibold text-surface-800 text-sm">{req.requesterId?.admissionNumber}</span>
                                        </div>
                                        <div className="p-3 bg-surface-50 rounded-xl">
                                            <span className="block text-surface-400 text-xs font-medium mb-0.5">Dept / Year</span>
                                            <span className="font-semibold text-surface-800 text-sm">{req.requesterId?.department} - Year {req.requesterId?.year}</span>
                                        </div>
                                        <div className="p-3 bg-surface-50 rounded-xl">
                                            <span className="block text-surface-400 text-xs font-medium mb-0.5">Type</span>
                                            <span className="font-semibold text-surface-800 text-sm">{req.requestType}</span>
                                        </div>
                                    </div>
                                    <div className="bg-surface-50 p-4 rounded-xl text-sm text-surface-600 whitespace-pre-wrap leading-relaxed line-clamp-3">
                                        {req.description}
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 w-full md:w-44 shrink-0">
                                    <button
                                        onClick={() => setSelectedRequest(req)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-surface-100 text-surface-700 px-4 py-2.5 rounded-xl hover:bg-surface-200 font-semibold transition-colors text-sm"
                                    >
                                        <Eye className="w-4 h-4" /> View
                                    </button>
                                    
                                    {user.role !== 'Advisor' && (
                                        <button
                                            onClick={() => processRequest(req._id, 'Approve')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-600 font-semibold transition-colors text-sm shadow-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                    )}

                                    {user.role !== 'Principal' && (
                                        <button
                                            onClick={() => processRequest(req._id, 'Forward')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-brand-500 text-white px-4 py-2.5 rounded-xl hover:bg-brand-600 font-semibold transition-colors text-sm shadow-sm"
                                        >
                                            <ArrowRight className="w-4 h-4" /> Forward
                                        </button>
                                    )}

                                    <button
                                        onClick={() => processRequest(req._id, 'Reject')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 font-semibold transition-colors text-sm border border-red-200"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-surface-50">
                            <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-600" />
                                Full Request Details
                            </h3>
                            <button 
                                onClick={() => setSelectedRequest(null)}
                                className="text-surface-400 hover:text-surface-600 transition-colors p-2 hover:bg-surface-100 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto flex-1 font-serif text-[15px] leading-relaxed text-surface-700 whitespace-pre-wrap">
                            {selectedRequest.description}
                        </div>

                        {selectedRequest.supportingDetailsUrl && (
                            <div className="px-8 py-4 bg-surface-50 border-t border-surface-200 flex flex-col h-96">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-surface-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-surface-500" />
                                        Attached Documents
                                    </span>
                                    <a 
                                        href={selectedRequest.supportingDetailsUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Open in New Tab ↗
                                    </a>
                                </div>
                                
                                {selectedRequest.supportingDetailsUrl.includes('drive.google.com') ? (
                                    <div className="flex-1 bg-white border border-surface-200 rounded-xl overflow-hidden relative flex flex-col">
                                        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex justify-between items-center">
                                            <span>
                                                <strong>Note:</strong> If you see a "403" error below, the student didn't set sharing to <em>"Anyone with the link"</em>.
                                            </span>
                                            <a 
                                                href={selectedRequest.supportingDetailsUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="underline hover:text-amber-900 font-medium whitespace-nowrap ml-4"
                                            >
                                                Try new tab
                                            </a>
                                        </div>
                                        <div className="flex-1 relative">
                                            <div className="absolute inset-0 flex items-center justify-center text-sm text-surface-400 -z-10">
                                                Loading document viewer...
                                            </div>
                                            <iframe 
                                                src={getEmbedUrl(selectedRequest.supportingDetailsUrl)} 
                                                className="w-full h-full z-10 relative bg-white" 
                                                title="Document Viewer"
                                                allow="autoplay"
                                            ></iframe>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 bg-white border border-surface-200 rounded-xl flex items-center justify-center p-6 text-center">
                                        <div>
                                            <div className="mx-auto w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-3">
                                                <FileText className="w-6 h-6 text-brand-600" />
                                            </div>
                                            <p className="text-sm text-surface-600">The attached link cannot be previewed directly.</p>
                                            <a 
                                                href={selectedRequest.supportingDetailsUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-block mt-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl transition-colors"
                                            >
                                                Open Link
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="px-6 py-4 border-t border-surface-100 bg-surface-50 flex justify-end">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-6 py-2.5 bg-white border border-surface-200 rounded-xl text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

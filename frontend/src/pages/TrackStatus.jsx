import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, CheckCircle, XCircle, ChevronRight, FileText, Search, Download } from 'lucide-react';

export default function TrackStatus() {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/requests/my');
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRequestDetails = async (id) => {
        try {
            const { data } = await api.get(`/requests/${id}`);
            setSelectedRequest(data);
        } catch (error) {
            console.error('Failed to fetch details', error);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'Approved') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
        if (status === 'Rejected') return 'text-red-700 bg-red-50 border-red-200';
        return 'text-amber-700 bg-amber-50 border-amber-200';
    };

    const getStatusIcon = (status) => {
        if (status === 'Approved') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        if (status === 'Rejected') return <XCircle className="w-5 h-5 text-red-500" />;
        return <Clock className="w-5 h-5 text-amber-500" />;
    };

    const handleDownloadApprovedLetter = (request) => {
        const logoUrl = window.location.origin + '/rit-logo.png';
        const signatureUrl = window.location.origin + '/principal-signature.png';
        
        // Find the approving authority from approval history
        const approvalEntry = [...request.approvalHistory].reverse().find(h => h.action === 'Approve');
        const approverName = approvalEntry?.processedBy?.name || 'Principal';
        const approverRole = approvalEntry?.role || 'Principal';
        const approvalDate = approvalEntry?.date ? new Date(approvalEntry.date).toLocaleDateString() : new Date().toLocaleDateString();
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Approved Request - ${request.title} - RIT Kottayam</title>
                    <style>
                        @page { size: A4; margin: 20mm 15mm; }
                        body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; color: #1a1a1a; }
                        .letterhead { display: flex; align-items: center; gap: 18px; padding-bottom: 12px; border-bottom: 2px solid #333; margin-bottom: 6px; }
                        .letterhead img { width: 70px; height: 70px; object-fit: contain; }
                        .letterhead-text { flex: 1; }
                        .letterhead-text h1 { font-size: 18px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
                        .letterhead-text h2 { font-size: 11px; font-weight: normal; margin: 2px 0 0; color: #444; }
                        .letterhead-address { text-align: right; font-size: 11px; color: #444; line-height: 1.4; }
                        .ref-line { display: flex; justify-content: space-between; font-size: 11px; color: #555; margin: 8px 0 20px; }
                        .letter-body { white-space: pre-wrap; line-height: 1.8; font-size: 14px; padding: 10px 0 30px; }
                        .approval-section { margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 20px; }
                        .approval-badge { background: #ecfdf5; border: 1.5px solid #6ee7b7; border-radius: 8px; padding: 10px 16px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #065f46; font-weight: bold; margin-bottom: 20px; }
                        .signature-block { display: flex; justify-content: flex-end; margin-top: 40px; text-align: center; }
                        .signature-block .sig-content { text-align: center; }
                        .signature-block img { height: 100px; object-fit: contain; display: block; margin: 0 auto 5px; }
                        .signature-block .sig-name { font-weight: bold; font-size: 13px; }
                        .signature-block .sig-role { font-size: 11px; color: #555; }
                        .footer-bar { border-top: 1.5px solid #333; padding-top: 8px; margin-top: 40px; font-size: 9px; color: #555; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="letterhead">
                        <img src="${logoUrl}" alt="RIT Logo" />
                        <div class="letterhead-text">
                            <h1>Rajiv Gandhi Institute of Technology</h1>
                            <h2>(Department of Technical Education, Government of Kerala)</h2>
                        </div>
                        <div class="letterhead-address">
                            Govt. Engineering College,<br/>
                            Velloor PO, Pampady<br/>
                            Kottayam-686501
                        </div>
                    </div>
                    <div class="ref-line">
                        <span>Ref: RIT/${new Date().getFullYear()}/${request._id.slice(-6).toUpperCase()}</span>
                        <span>Date: ${approvalDate}</span>
                    </div>
                    <div class="letter-body">${request.description}</div>
                    <div class="approval-section">
                        <div class="approval-badge">✓ APPROVED</div>
                        <div class="signature-block">
                            <div class="sig-content">
                                <img src="${signatureUrl}" alt="Signature" />
                                <div class="sig-name">${approverName}</div>
                                <div class="sig-role">${approverRole}</div>
                                <div class="sig-role">Rajiv Gandhi Institute of Technology, Kottayam</div>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bar">
                        Ph: 0481-2507763/2506153 &nbsp;|&nbsp; Fax: 0481-2506153 &nbsp;|&nbsp; e-mail: info@rit.ac.in, principal@rit.ac.in &nbsp;|&nbsp; Web: www.rit.ac.in
                    </div>
                    <script>
                        const imgs = document.querySelectorAll('img');
                        let loaded = 0;
                        const totalImgs = imgs.length;
                        const tryPrint = () => { loaded++; if (loaded >= totalImgs) { window.print(); window.onafterprint = () => window.close(); } };
                        imgs.forEach(img => { if (img.complete) tryPrint(); else { img.onload = tryPrint; img.onerror = tryPrint; } });
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (loading) return (
        <div className="p-12 text-center text-surface-400 animate-fade-in">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading requests...</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)] animate-fade-in">
            {/* List View */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-surface-100 bg-gradient-to-r from-brand-50 to-surface-50">
                    <h2 className="text-lg font-bold text-surface-900">My Requests</h2>
                    <p className="text-xs text-surface-400 mt-0.5">{requests.length} total requests</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
                                <Search className="w-5 h-5 text-surface-300" />
                            </div>
                            <p className="text-surface-500 text-sm">No requests found.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-surface-100">
                            {requests.map((req) => (
                                <li key={req._id}>
                                    <button
                                        onClick={() => loadRequestDetails(req._id)}
                                        className={`w-full text-left p-4 hover:bg-brand-50/50 transition-all duration-200 ${selectedRequest?._id === req._id ? 'bg-brand-50 border-l-3 border-l-brand-500' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className="font-semibold text-surface-900 text-sm truncate pr-2">{req.title}</span>
                                            <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${selectedRequest?._id === req._id ? 'text-brand-500 rotate-90' : 'text-surface-300'}`} />
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-surface-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                            <span className={`px-2 py-0.5 rounded-lg font-semibold border ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Details View */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden flex flex-col">
                {selectedRequest ? (
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-brand-50 rounded-xl">
                                <FileText className="w-6 h-6 text-brand-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-surface-900">{selectedRequest.title}</h3>
                                <p className="text-sm text-surface-400 font-mono">ID: {selectedRequest._id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100">
                                <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider mb-1">Type</p>
                                <p className="font-semibold text-surface-900 text-sm">{selectedRequest.requestType}</p>
                            </div>
                            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100">
                                <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider mb-1">Target Date</p>
                                <p className="font-semibold text-surface-900 text-sm">{new Date(selectedRequest.date).toLocaleDateString()}</p>
                            </div>
                            <div className="p-4 bg-surface-50 rounded-2xl col-span-2 border border-surface-100">
                                <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider mb-2">Current Status</p>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(selectedRequest.status)}
                                    <p className={`font-bold text-sm ${selectedRequest.status === 'Approved' ? 'text-emerald-600' : selectedRequest.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                                        {selectedRequest.status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Download Approved Letter */}
                        {selectedRequest.status === 'Approved' && (
                            <div className="mb-6">
                                <button
                                    onClick={() => handleDownloadApprovedLetter(selectedRequest)}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Approved Letter with Signature
                                </button>
                            </div>
                        )}

                        <div className="mb-8">
                            <h4 className="font-bold text-surface-900 mb-3">Description</h4>
                            <p className="text-surface-600 bg-surface-50 p-5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed border border-surface-100">
                                {selectedRequest.description}
                            </p>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h4 className="font-bold text-surface-900 mb-4">Approval History</h4>
                            {selectedRequest.approvalHistory.length === 0 ? (
                                <p className="text-sm text-surface-400 italic bg-surface-50 p-4 rounded-xl">No actions taken yet.</p>
                            ) : (
                                <div className="space-y-5 pl-4 border-l-2 border-brand-100">
                                    {selectedRequest.approvalHistory.map((history, idx) => (
                                        <div key={idx} className="relative pl-6">
                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-brand-100 border-2 border-white shadow-sm flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                                            </div>
                                            <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="font-semibold text-surface-900 text-sm">{history.action} by {history.processedBy?.name}</span>
                                                    <span className="text-xs text-surface-400">{new Date(history.date).toLocaleString()}</span>
                                                </div>
                                                <div className="text-sm text-surface-500">
                                                    <p className="font-semibold text-surface-400 text-xs uppercase">{history.role}</p>
                                                    {history.remarks && <p className="mt-1 italic text-surface-600">"{history.remarks}"</p>}
                                                    {history.digitalSignature && (
                                                        <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> Digitally Signed
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="w-20 h-20 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
                            <FileText className="w-10 h-10 text-surface-200" />
                        </div>
                        <p className="text-lg font-semibold text-surface-400">Select a request</p>
                        <p className="text-sm text-surface-300 mt-1">Click on a request to view its details</p>
                    </div>
                )}
            </div>
        </div>
    );
}

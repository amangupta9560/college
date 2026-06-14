import React, { useState, useEffect } from 'react';
import { api } from '../Context/AuthContext.jsx';
import { Flag, X, Check } from 'lucide-react';

export const ReportModal = ({ isOpen, onClose, targetType, targetId }) => {
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reasons = [
    { value: 'spam', label: 'Spam / Advertising' },
    { value: 'harassment', label: 'Harassment / Abuse' },
    { value: 'fake', label: 'Fake Account / Project' },
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'other', label: 'Other Reason' }
  ];

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);
      setDescription('');
      setReason('spam');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!targetId) {
      return setError('Invalid report target.');
    }

    setSubmitting(true);
    try {
      await api.post('/api/reports', {
        targetType,
        targetId,
        reason,
        description
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md bg-base-100 border border-border rounded-3xl p-6 relative">
        <button 
          onClick={onClose}
          className="btn btn-ghost btn-circle btn-xs absolute top-4 right-4"
        >
          <X size={16} />
        </button>

        <h3 className="font-extrabold text-base border-b border-border pb-2.5 text-base-content flex items-center gap-1.5">
          <Flag size={16} className="text-danger" /> Report Content
        </h3>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center animate-bounce">
              <Check size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-base-content mt-2">Report Submitted!</h4>
            <p className="text-[10px] text-base-content/50">Thank you. Administrators will review this report shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 text-xs font-semibold">
            {error && (
              <div className="alert alert-error rounded-xl py-2 px-3 text-[10px] font-bold text-white">
                {error}
              </div>
            )}

            {/* Reason Select */}
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Why are you reporting this?</span>
              </label>
              <select 
                className="select select-bordered select-sm rounded-xl text-xs font-semibold"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                {reasons.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Details / Explanation</span>
              </label>
              <textarea
                rows={4}
                placeholder="Provide additional details or context to help administrators review this report... (Max 500 characters)"
                className="textarea textarea-bordered rounded-xl text-xs font-normal leading-relaxed"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                required
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-error btn-sm rounded-xl font-bold mt-2 text-white h-9 shadow-md shadow-danger/10"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;

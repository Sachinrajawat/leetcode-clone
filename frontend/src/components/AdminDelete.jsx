import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { fetchAllProblems, removeProblemLocally } from '../problemSlice'; // Import Redux actions

const AdminDelete = () => {
  const dispatch = useDispatch();
  
  // 1. Pull the global problems list and loading state from Redux
  const { problemsList, isLoading, hasFetchedOnce } = useSelector((state) => state.problems);
  
  const [error, setError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // 2. Only fetch from the backend if we haven't fetched yet
  useEffect(() => {
    if (!hasFetchedOnce) {
      dispatch(fetchAllProblems());
    }
  }, [dispatch, hasFetchedOnce]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) return;
    
    try {
      setDeleteSuccess('');
      setError(null);
      
      // Hit the backend to actually delete it from the database
      await axiosClient.delete(`/problem/delete/${id}`);
      
      // 3. Dispatch the action to remove it from the global Redux store instantly
      dispatch(removeProblemLocally(id));
      
      setDeleteSuccess('Problem deleted successfully.');
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete problem');
      console.error(err);
    }
  };

  // Only show the full-screen loader if it's the very first time fetching
  if (isLoading && !hasFetchedOnce) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Safely fallback in case Redux state is ever malformed
  const safeProblems = Array.isArray(problemsList) ? problemsList : [];

  return (
    <div className="min-h-screen bg-base-200 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="btn btn-ghost btn-sm btn-circle">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Delete Problems</h1>
              <p className="text-base-content/70 text-sm mt-1">Manage and remove platform challenges</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error shadow-sm mb-6">
            <span>{error}</span>
          </div>
        )}
        
        {deleteSuccess && (
          <div className="alert alert-success shadow-sm mb-6">
            <span>{deleteSuccess}</span>
          </div>
        )}

        {/* Table Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
          {safeProblems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200/50">
                  <tr>
                    <th className="w-16">#</th>
                    <th>Title</th>
                    <th className="w-32">Difficulty</th>
                    <th className="w-32">Tags</th>
                    <th className="w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeProblems.map((problem, index) => (
                    <tr key={problem._id} className="hover">
                      <th>{index + 1}</th>
                      <td className="font-medium">{problem.title}</td>
                      <td>
                        <span className={`badge badge-sm font-medium ${
                          problem.difficulty === 'easy' ? 'badge-success' : 
                          problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info badge-outline badge-sm">
                          {problem.tags}
                        </span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => handleDelete(problem._id)}
                          className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-white"
                          title="Delete Problem"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-base-content/60">
              No problems found in the database.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default AdminDelete;
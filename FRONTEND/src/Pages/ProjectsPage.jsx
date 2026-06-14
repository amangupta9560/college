import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, useAuth } from '../Context/AuthContext.jsx';
import { Code, Plus, Search, Github, Globe, ArrowRight } from 'lucide-react';
import Pagination from '../Components/Pagination.jsx';

export const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = `/api/projects?page=${currentPage}&limit=6`;
      if (selectedTech) {
        url += `&techStack=${selectedTech}`;
      }
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const res = await api.get(url);
      
      // Client-side text search filter for title & description
      let fetchedProjects = res.data.data.projects || [];
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        fetchedProjects = fetchedProjects.filter(
          p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
        );
      }
      
      setProjects(fetchedProjects);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, selectedTech, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTech('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Common technologies for filters
  const techOptions = ['React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Django', 'TypeScript', 'Flutter', 'Next.js', 'Solidity'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return 'badge-warning';
      case 'completed':
        return 'badge-success';
      case 'archived':
        return 'badge-ghost';
      default:
        return 'badge-ghost';
    }
  };

  const formatStatus = (status) => {
    return status ? status.replace('_', ' ').toUpperCase() : '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-8 md:p-12 mb-8 shadow-lg shadow-primary/20 text-white">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pointer-events-none">
          <Code size={400} className="translate-x-1/4 translate-y-1/4 scale-150 rotate-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl flex flex-col gap-4">
          <span className="badge badge-accent bg-white/20 border-none font-bold text-xs uppercase text-white tracking-widest px-3 py-1.5 rounded-lg">Showcase Directory</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Student Projects Portfolio</h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Discover and share innovative projects built by college students, hackers, and teams. Tag collaborators, link GitHub repos, and present your portfolio to the world.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link to="/projects/create" className="btn btn-neutral bg-white text-primary hover:bg-white/90 border-none rounded-xl btn-sm font-bold shadow-md shadow-black/10">
              Add Your Project
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="card bg-base-100 border border-border p-5 rounded-2xl gap-4 transition-colors duration-200 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-extrabold text-sm text-base-content">Filters</h3>
              <button onClick={handleResetFilters} className="btn btn-link btn-xs text-primary font-bold hover:underline p-0 min-h-0 h-auto">
                Reset All
              </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Search title/description</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Type to search..." 
                  className="input input-bordered input-sm rounded-xl text-xs w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-base-content/40" />
              </div>
            </form>

            {/* Tech Stack filter */}
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Technology</span>
              </label>
              <select 
                className="select select-bordered select-sm rounded-xl text-xs"
                value={selectedTech}
                onChange={(e) => {
                  setSelectedTech(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Any Technology</option>
                {techOptions.map((tech) => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>

            {/* Project Status */}
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Development Status</span>
              </label>
              <select 
                className="select select-bordered select-sm rounded-xl text-xs"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Any Status</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <button onClick={fetchProjects} className="btn btn-primary btn-sm rounded-xl font-bold mt-2">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Project Gallery Grid */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {loading ? (
            <div className="flex justify-center items-center py-20 min-h-[30vh]">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : projects.length === 0 ? (
            <div className="card bg-base-100 border border-border p-12 text-center flex flex-col items-center justify-center min-h-[30vh] gap-3 rounded-2xl">
              <Code size={40} className="text-base-content/30" />
              <h3 className="font-extrabold text-base">No Projects Found</h3>
              <p className="text-xs text-base-content/50 max-w-sm">
                No projects match your filter settings. Create a new project or change your filters to see results.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline btn-xs rounded-xl font-bold mt-2">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div key={project._id} className="card bg-base-100 border border-border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full group">
                    {/* Thumbnail */}
                    <div className="h-44 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden shrink-0 border-b border-border">
                      <img 
                        src={project.thumbnailURL || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop'} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                      <span className={`absolute top-3 right-3 badge ${getStatusBadge(project.status)} font-extrabold text-[9px] px-2.5 py-1.5 border-none shadow-sm rounded-lg`}>
                        {formatStatus(project.status)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-extrabold text-base text-base-content line-clamp-1 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        
                        {/* Owner Card Info */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="avatar">
                            <div className="w-5 h-5 rounded-full">
                              <img 
                                src={project.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${project.owner?.firstName || 'Owner'}`} 
                                alt="Owner" 
                              />
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-base-content/50">
                            By {project.owner?.firstName} {project.owner?.lastName}
                          </span>
                        </div>

                        <p className="text-xs text-base-content/65 line-clamp-3 leading-relaxed font-normal">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {/* Tech stack badges */}
                        <div className="flex flex-wrap gap-1">
                          {project.techStack?.slice(0, 4).map((tech, i) => (
                            <span key={i} className="badge badge-xs bg-base-200 border-none font-semibold text-[8px] rounded-md px-1.5 py-1 text-base-content/80">
                              {tech}
                            </span>
                          ))}
                          {project.techStack?.length > 4 && (
                            <span className="badge badge-xs bg-base-200 border-none font-bold text-[8px] rounded-md px-1.5 py-1 text-base-content/55">
                              +{project.techStack.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Footer Links / Button */}
                        <div className="flex justify-between items-center pt-3 border-t border-border/60">
                          <div className="flex items-center gap-2">
                            {project.githubURL && (
                              <a href={project.githubURL} target="_blank" rel="noopener noreferrer" className="text-base-content/40 hover:text-primary transition-colors p-1" title="GitHub Repo">
                                <Github size={15} />
                              </a>
                            )}
                            {project.demoURL && (
                              <a href={project.demoURL} target="_blank" rel="noopener noreferrer" className="text-base-content/40 hover:text-primary transition-colors p-1" title="Live Demo">
                                <Globe size={15} />
                              </a>
                            )}
                          </div>

                          <Link to={`/projects/${project._id}`} className="btn btn-ghost hover:bg-primary/5 hover:text-primary btn-xs font-bold rounded-lg text-[10px] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                            View details <ArrowRight size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;

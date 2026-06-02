import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { Plus, Trash2, Edit3, X, Layers, Sparkles } from 'lucide-react';
import { Segment } from '../types/database.types';

export const SegmentsView: React.FC = () => {
  const {
    segments,
    leads,
    organizations,
    saveSegment,
    deleteSegment,
    refreshAll
  } = useValithOS();

  // Create Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Edit Form State
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Submit Handler (Create)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await saveSegment({
        name: name.trim(),
        description: description.trim()
      });
      setName('');
      setDescription('');
      setShowAddForm(false);
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Handler (Update)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSegment || !editName.trim()) return;

    try {
      await saveSegment({
        id: editingSegment.id,
        name: editName.trim(),
        description: editDescription.trim()
      });
      setEditingSegment(null);
      setEditName('');
      setEditDescription('');
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this segment? Leads and Organizations currently referencing this segment will keep their segment reference but the segment option won\'t appear in new drop-downs.')) {
      try {
        await deleteSegment(id);
        refreshAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Get Segment stats
  const getSegmentStats = (segmentName: string) => {
    const segmentLeads = leads.filter(l => l.segment === segmentName);
    const leadCount = segmentLeads.length;
    const orgCount = organizations.filter(o => o.segment === segmentName).length;
    const totalPipelineValue = segmentLeads.reduce((sum, l) => sum + (l.deal_value_estimate || 0), 0);
    return { leadCount, orgCount, totalPipelineValue };
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Lead Segments</h1>
          <p className="text-xs text-typography-muted">Group your pipeline accounts by industry segments, size criteria, or partnership status</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 bg-typography text-white text-xs px-3 py-1.5 rounded uppercase font-bold tracking-wider hover:bg-typography/90 transition-all shadow-sm"
        >
          <Plus size={14} /> Add Segment
        </button>
      </div>

      {/* SEGMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map(segment => {
          const { leadCount, orgCount, totalPipelineValue } = getSegmentStats(segment.name);
          return (
            <div
              key={segment.id}
              className="bg-background-card border border-border rounded-lg p-5 flex flex-col justify-between hover:border-aurum/40 hover:shadow-premium transition-all duration-300 relative group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-aurum/10 text-aurum rounded">
                      <Layers size={16} />
                    </div>
                    <h3 className="font-bold text-sm text-typography tracking-tight uppercase group-hover:text-aurum transition-colors">
                      {segment.name}
                    </h3>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingSegment(segment);
                        setEditName(segment.name);
                        setEditDescription(segment.description || '');
                      }}
                      className="text-typography-light hover:text-typography transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    {segment.name !== 'Other' && (
                      <button
                        onClick={() => handleDelete(segment.id)}
                        className="text-typography-light hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-typography-light leading-relaxed min-h-[40px]">
                  {segment.description || 'No description provided.'}
                </p>
              </div>

              {/* STATS FOOTER */}
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-typography-muted">
                <div>
                  <span className="block text-typography-light text-[9px] font-normal uppercase tracking-normal">Orgs / Leads</span>
                  <span className="text-typography">{orgCount} / {leadCount}</span>
                </div>
                <div className="text-right">
                  <span className="block text-typography-light text-[9px] font-normal uppercase tracking-normal">Est. Pipeline</span>
                  <span className="text-aurum">PKR {totalPipelineValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}

        {segments.length === 0 && (
          <div className="col-span-full border border-dashed border-border rounded-lg p-12 text-center">
            <Layers className="mx-auto text-typography-muted mb-3" size={32} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-typography">No custom segments configured</h3>
            <p className="text-[10px] text-typography-muted max-w-xs mx-auto mt-1">
              Configure lead segmentation categories to categorize your client acquisition pipeline.
            </p>
          </div>
        )}
      </div>

      {/* CREATE SEGMENT DIALOG */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-typography-light hover:text-typography"
            >
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography flex items-center gap-1.5">
              <Sparkles size={16} className="text-aurum animate-pulse" /> Add Lead Segment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Segment Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. A5 Enterprise Scale"
                  className="w-full text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail industry types, business scale indicators, or qualification notes..."
                  className="w-full text-xs p-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Create Lead Segment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SEGMENT DIALOG */}
      {editingSegment && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative">
            <button
              onClick={() => setEditingSegment(null)}
              className="absolute top-4 right-4 text-typography-light hover:text-typography"
            >
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography flex items-center gap-1.5">
              Edit Lead Segment
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Segment Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs p-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { Plus, Trash2, Edit3, X, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { Offer } from '../types/database.types';

export const OffersView: React.FC = () => {
  const {
    offers,
    leads,
    saveOffer,
    deleteOffer,
    refreshAll
  } = useValithOS();

  // Create Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Edit Form State
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Submit Handler (Create)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await saveOffer({
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
    if (!editingOffer || !editName.trim()) return;

    try {
      await saveOffer({
        id: editingOffer.id,
        name: editName.trim(),
        description: editDescription.trim()
      });
      setEditingOffer(null);
      setEditName('');
      setEditDescription('');
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer? Leads currently referencing this offer will keep their offer angle reference but the offer option won\'t appear in new drop-downs.')) {
      try {
        await deleteOffer(id);
        refreshAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Get Offer stats
  const getOfferStats = (offerName: string) => {
    const offerLeads = leads.filter(l => l.offer_angle === offerName);
    const leadCount = offerLeads.length;
    const valueAllowedStages = ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const totalPipelineValue = offerLeads.reduce((sum, l) => {
      const isAllowed = valueAllowedStages.includes(l.stage);
      return sum + (isAllowed ? (l.deal_value_estimate || 0) : 0);
    }, 0);
    return { leadCount, totalPipelineValue };
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Offer Angles</h1>
          <p className="text-xs text-typography-muted">Define and manage AI solutions, service angles, and system packages offered to targets</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 bg-typography text-white text-xs px-3 py-1.5 rounded uppercase font-bold tracking-wider hover:bg-typography/90 transition-all shadow-sm"
        >
          <Plus size={14} /> Add Offer Angle
        </button>
      </div>

      {/* OFFERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map(offer => {
          const { leadCount, totalPipelineValue } = getOfferStats(offer.name);
          return (
            <div
              key={offer.id}
              className="bg-background-card border border-border rounded-lg p-5 flex flex-col justify-between hover:border-aurum/40 hover:shadow-premium transition-all duration-300 relative group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-aurum/10 text-aurum rounded">
                      <Tag size={16} />
                    </div>
                    <h3 className="font-bold text-sm text-typography tracking-tight uppercase group-hover:text-aurum transition-colors">
                      {offer.name}
                    </h3>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingOffer(offer);
                        setEditName(offer.name);
                        setEditDescription(offer.description || '');
                      }}
                      className="text-typography-light hover:text-typography transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    {offer.name !== 'Other' && (
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="text-typography-light hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-typography-light leading-relaxed min-h-[40px]">
                  {offer.description || 'No description provided.'}
                </p>
              </div>

              {/* STATS FOOTER */}
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-typography-muted">
                <div>
                  <span className="block text-typography-light text-[9px] font-normal uppercase tracking-normal">Active Leads</span>
                  <span className="text-typography">{leadCount}</span>
                </div>
                <div className="text-right">
                  <span className="block text-typography-light text-[9px] font-normal uppercase tracking-normal">Est. Pipeline</span>
                  <span className="text-aurum">PKR {totalPipelineValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}

        {offers.length === 0 && (
          <div className="col-span-full border border-dashed border-border rounded-lg p-12 text-center">
            <Tag className="mx-auto text-typography-muted mb-3" size={32} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-typography">No custom offers configured</h3>
            <p className="text-[10px] text-typography-muted max-w-xs mx-auto mt-1">
              Add custom AI solution offer angles to structure your outbound CRM and client matching.
            </p>
          </div>
        )}
      </div>

      {/* CREATE OFFER DIALOG */}
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
              <Sparkles size={16} className="text-aurum animate-pulse" /> Add Offer Angle
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Offer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Autonomous RFP Analyzer"
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
                  placeholder="Specify details, target bottleneck, or expected leverage..."
                  className="w-full text-xs p-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Create Offer Angle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT OFFER DIALOG */}
      {editingOffer && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative">
            <button
              onClick={() => setEditingOffer(null)}
              className="absolute top-4 right-4 text-typography-light hover:text-typography"
            >
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography flex items-center gap-1.5">
              Edit Offer Angle
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Offer Name</label>
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

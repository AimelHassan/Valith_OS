import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { Lead, Organization } from '../types/database.types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  Link2,
  CalendarCheck,
  Share2,
  Download,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { leads, organizations, saveLead, refreshAll } = useValithOS();

  const [viewMode, setViewMode] = useState<'week' | 'agenda'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  });
  const [presentationMode, setPresentationMode] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Form states for quick schedule
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [quickLeadId, setQuickLeadId] = useState('');
  const [quickMeetingAt, setQuickMeetingAt] = useState('');
  const [quickMeetingType, setQuickMeetingType] = useState('Discovery Call');
  const [quickMeetingStatus, setQuickMeetingStatus] = useState('Scheduled');

  // Filter leads that have scheduled meetings
  const meetingLeads = leads.filter((l) => l.next_meeting_at);

  // Navigate weeks
  const adjustWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeekStart(newDate);
  };

  // Get start and end date text for headers
  const getWeekRangeString = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Generate 7 days starting from currentWeekStart
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Helper to check if two dates are the same calendar day
  const isSameDay = (date1: Date, dateString: string) => {
    const d2 = new Date(dateString);
    return (
      date1.getFullYear() === d2.getFullYear() &&
      date1.getMonth() === d2.getMonth() &&
      date1.getDate() === d2.getDate()
    );
  };

  // Format time (e.g. 14:30 -> 2:30 PM)
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  // Presentation Mode Masking
  const maskCompanyName = (name: string) => {
    if (!presentationMode) return name;
    // Replace with acronyms/clean initials
    const words = name.split(' ');
    if (words.length === 1) return `${name.substring(0, 2).toUpperCase()} Solutions`;
    return words.map((w) => w[0]).join('') + ' Ltd';
  };

  const getSaaSCardTag = (stage: string) => {
    if (['SOW Sent', 'Negotiation'].includes(stage)) return 'Proposal Stage';
    if (stage === 'Closed Won') return 'Client';
    if (stage === 'Demo Sent') return 'Demo';
    if (stage === 'Meeting Scheduled') return 'Meeting';
    return 'Warm Lead';
  };

  // Quick schedule submit
  const handleQuickScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLeadId || !quickMeetingAt) return;

    const lead = leads.find((l) => l.id === quickLeadId);
    if (!lead) return;

    await saveLead({
      ...lead,
      next_meeting_at: quickMeetingAt,
      meeting_type: quickMeetingType,
      meeting_status: quickMeetingStatus
    });

    setQuickLeadId('');
    setQuickMeetingAt('');
    setShowQuickSchedule(false);
    refreshAll();
  };

  // ICS calendar generation
  const handleExportICS = (lead: Lead) => {
    if (!lead.next_meeting_at) return;
    const org = organizations.find((o) => o.id === lead.organization_id);
    const company = maskCompanyName(org?.name || 'Client');
    const start = new Date(lead.next_meeting_at);
    const end = new Date(start.getTime() + 45 * 60 * 1000); // Default to 45 mins

    const formatICSDate = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Valith OS//Outreach Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${lead.id}-meeting`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:Valith OS - ${lead.meeting_type} with ${company}`,
      `DESCRIPTION:Pipeline Stage: ${lead.stage}\\nStatus: ${lead.meeting_status}\\nNotes: ${lead.notes || 'No notes'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `valith_meeting_${lead.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Calendar Link generator
  const getGoogleCalendarUrl = (lead: Lead) => {
    if (!lead.next_meeting_at) return '#';
    const org = organizations.find((o) => o.id === lead.organization_id);
    const company = maskCompanyName(org?.name || 'Client');
    const start = new Date(lead.next_meeting_at);
    const end = new Date(start.getTime() + 45 * 60 * 1000);

    const formatGoogleDate = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const text = encodeURIComponent(`Valith OS: ${lead.meeting_type} with ${company}`);
    const dates = `${formatGoogleDate(start)}/${formatGoogleDate(end)}`;
    const details = encodeURIComponent(`Pipeline Stage: ${lead.stage}\nStatus: ${lead.meeting_status}\nOutreach Angle: ${lead.offer_angle}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&sf=true&output=xml`;
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Interaction Calendar</h1>
          <p className="text-xs text-typography-muted">Schedule and review client calls, demo reviews, and pipeline checkpoints</p>
        </div>

        <div className="flex space-x-3 text-xs">
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className={`flex items-center space-x-1.5 border px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors ${
              presentationMode 
                ? 'bg-aurum text-typography border-aurum' 
                : 'border-border bg-background-card hover:bg-background-soft'
            }`}
          >
            {presentationMode ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{presentationMode ? 'Presentation Mode ON' : 'Presentation Mode'}</span>
          </button>

          <button
            onClick={() => setShowQuickSchedule(true)}
            className="flex items-center space-x-2 bg-typography hover:bg-typography/90 text-white px-3 py-1.5 rounded font-semibold uppercase tracking-wider"
          >
            <Plus size={14} className="text-aurum" />
            <span>Schedule Interaction</span>
          </button>
        </div>
      </div>

      {/* FILTER & MODE BAR */}
      <div className="bg-background-card border border-border rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Navigation for weekly view */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => adjustWeek('prev')}
            className="p-1 border border-border rounded hover:bg-background-soft transition-all text-typography-muted"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-typography">
            {getWeekRangeString()}
          </span>
          <button
            onClick={() => adjustWeek('next')}
            className="p-1 border border-border rounded hover:bg-background-soft transition-all text-typography-muted"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-background-soft p-1 rounded border border-border/80">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              viewMode === 'week' 
                ? 'bg-background-card text-typography shadow-sm' 
                : 'text-typography-muted hover:text-typography'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              viewMode === 'agenda' 
                ? 'bg-background-card text-typography shadow-sm' 
                : 'text-typography-muted hover:text-typography'
            }`}
          >
            Agenda View
          </button>
        </div>
      </div>

      {/* VIEW MODES */}
      {viewMode === 'week' ? (
        /* WEEKLY GRID MODE */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-h-[500px]">
          {weekDays.map((day, idx) => {
            const dayMeetings = meetingLeads.filter((l) => isSameDay(day, l.next_meeting_at!));
            const isToday = isSameDay(new Date(), day.toISOString());

            return (
              <div
                key={idx}
                className={`bg-background-card border rounded-lg p-3 flex flex-col space-y-3.5 min-h-[250px] transition-all ${
                  isToday 
                    ? 'border-aurum shadow-premium ring-1 ring-aurum/10 bg-aurum-glow/5' 
                    : 'border-border/60'
                }`}
              >
                {/* Day Header */}
                <div className="border-b border-border/50 pb-2 text-center">
                  <span className="block text-[9px] uppercase font-bold tracking-wider text-typography-light">
                    {day.toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <span className={`text-base font-bold tracking-tight block ${isToday ? 'text-aurum-dark' : 'text-typography'}`}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Day Items */}
                <div className="flex-1 space-y-3">
                  {dayMeetings.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-8 text-center text-[10px] text-typography-light/60 uppercase tracking-widest font-semibold italic">
                      —
                    </div>
                  ) : (
                    dayMeetings.map((lead) => {
                      const org = organizations.find((o) => o.id === lead.organization_id);
                      const timeStr = formatTime(lead.next_meeting_at!);
                      const clientName = org ? maskCompanyName(org.name) : 'Client';
                      const meetingType = lead.meeting_type || 'Discovery';

                      return (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="bg-background border border-border/80 hover:border-aurum rounded p-2.5 shadow-sm text-xs cursor-pointer hover:shadow-premium transition-all duration-200 border-l-2 border-l-aurum flex flex-col justify-between min-h-[110px]"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[8px] text-typography-light font-bold">
                              <span className="flex items-center space-x-1 uppercase">
                                <Clock size={8} />
                                <span>{timeStr}</span>
                              </span>
                              <span className="uppercase tracking-wider px-1 bg-background-soft border border-border rounded">
                                {lead.source_channel}
                              </span>
                            </div>
                            <span className="block font-bold text-typography leading-tight truncate mt-1">
                              {clientName}
                            </span>
                            <span className="block text-[10px] text-typography-muted truncate leading-tight font-medium">
                              {meetingType}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-aurum-glow text-aurum-dark rounded border border-aurum/20">
                              {getSaaSCardTag(lead.stage)}
                            </span>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                              lead.meeting_status === 'Completed'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : lead.meeting_status === 'Cancelled'
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : 'bg-background-soft text-typography-muted border-border'
                            }`}>
                              {lead.meeting_status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* AGENDA VIEW MODE */
        <div className="bg-background-card border border-border rounded-lg shadow-premium max-w-2xl mx-auto divide-y divide-border">
          {(() => {
            // Group meetings by day relative to today
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const sortedMeetings = [...meetingLeads].sort(
              (a, b) => new Date(a.next_meeting_at!).getTime() - new Date(b.next_meeting_at!).getTime()
            );

            if (sortedMeetings.length === 0) {
              return (
                <div className="py-12 text-center text-typography-light text-xs uppercase tracking-wider font-bold">
                  No interactions scheduled.
                </div>
              );
            }

            // Simple rendering of grouped agenda
            return sortedMeetings.map((lead) => {
              const org = organizations.find((o) => o.id === lead.organization_id);
              const mDate = new Date(lead.next_meeting_at!);
              const mDay = new Date(mDate.getFullYear(), mDate.getMonth(), mDate.getDate());

              let dayLabel = mDay.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
              if (mDay.getTime() === today.getTime()) {
                dayLabel = 'Today';
              } else if (mDay.getTime() === tomorrow.getTime()) {
                dayLabel = 'Tomorrow';
              }

              const timeStr = formatTime(lead.next_meeting_at!);
              const company = org ? maskCompanyName(org.name) : 'Client';

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="p-4 hover:bg-background-soft cursor-pointer flex justify-between items-center transition-all group"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-24 shrink-0 text-left">
                      <span className="text-[10px] font-bold text-aurum uppercase tracking-wider block">
                        {dayLabel}
                      </span>
                      <span className="text-xs font-bold text-typography mt-0.5 block flex items-center space-x-1">
                        <Clock size={11} className="text-typography-light" />
                        <span>{timeStr}</span>
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-typography group-hover:text-aurum transition-colors">
                        {company}
                      </h4>
                      <p className="text-[10px] text-typography-muted">
                        {lead.meeting_type} • <span className="italic">{lead.lead_name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-[10px]">
                    <span className="font-bold uppercase px-2 py-0.5 bg-background-soft border border-border rounded text-typography-muted">
                      {getSaaSCardTag(lead.stage)}
                    </span>
                    <span className={`font-bold uppercase px-2 py-0.5 rounded border ${
                      lead.meeting_status === 'Completed'
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : lead.meeting_status === 'Cancelled'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-background-soft text-typography-muted border-border'
                    }`}>
                      {lead.meeting_status}
                    </span>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* DETAIL MODAL DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-typography-light hover:text-typography"
            >
              <X size={18} />
            </button>

            <span className="text-[9px] font-bold text-aurum uppercase tracking-widest block">Interaction Checkpoint</span>
            <h2 className="text-sm font-bold text-typography mt-1 leading-snug">
              {selectedLead.meeting_type || 'Client Call'} with {organizations.find(o => o.id === selectedLead.organization_id)?.name}
            </h2>

            <div className="my-5 border-t border-b border-border py-4 space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-typography-light font-medium">Scheduled Time:</span>
                <span className="font-bold text-typography">
                  {selectedLead.next_meeting_at ? new Date(selectedLead.next_meeting_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-typography-light font-medium">Outreach Offer Angle:</span>
                <span className="font-semibold text-typography">{selectedLead.offer_angle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-typography-light font-medium">Lead Stage:</span>
                <span className="font-semibold text-typography">{selectedLead.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-typography-light font-medium">Interaction Status:</span>
                <span className="font-bold text-typography uppercase text-[10px]">{selectedLead.meeting_status || 'Scheduled'}</span>
              </div>

              {/* Private Notes - sensitive */}
              <div className="space-y-1 pt-2 border-t border-border/60">
                <span className="text-typography-light font-medium block">Outreach Diagnostic Notes:</span>
                <p className={`p-2.5 bg-background-soft rounded text-[11px] leading-relaxed text-typography-muted select-none ${
                  presentationMode ? 'blur-sm pointer-events-none' : ''
                }`}>
                  {selectedLead.notes || 'No private notes logged for this scheduled checkpoint.'}
                </p>
                {presentationMode && (
                  <span className="text-[9px] text-red-500 font-semibold block uppercase">Sensitive details blurred in Presentation Mode</span>
                )}
              </div>
            </div>

            {/* Sync options */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-bold text-typography-muted uppercase tracking-wider block">Google Calendar Sync</span>
              <div className="flex gap-3">
                <a
                  href={getGoogleCalendarUrl(selectedLead)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 border border-border hover:border-aurum bg-background-card hover:bg-background-soft rounded py-2 text-xs font-semibold uppercase tracking-wider text-typography flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Share2 size={13} className="text-aurum" />
                  <span>Add to Google Cal</span>
                </a>
                <button
                  onClick={() => handleExportICS(selectedLead)}
                  className="flex-1 border border-border hover:border-aurum bg-background-card hover:bg-background-soft rounded py-2 text-xs font-semibold uppercase tracking-wider text-typography flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download size={13} className="text-aurum" />
                  <span>Download .ics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK SCHEDULE MODAL */}
      {showQuickSchedule && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative">
            <button
              onClick={() => setShowQuickSchedule(false)}
              className="absolute top-4 right-4 text-typography-light hover:text-typography"
            >
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">Schedule Interaction</h2>
            <form onSubmit={handleQuickScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Select CRM Lead</label>
                <select
                  value={quickLeadId}
                  onChange={(e) => setQuickLeadId(e.target.value)}
                  className="w-full text-xs"
                  required
                >
                  <option value="">-- Choose Lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.lead_name} ({l.stage})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Meeting Date & Time</label>
                <input
                  type="datetime-local"
                  value={quickMeetingAt}
                  onChange={(e) => setQuickMeetingAt(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Meeting Type</label>
                  <select
                    value={quickMeetingType}
                    onChange={(e) => setQuickMeetingType(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="Discovery Call">Discovery Call</option>
                    <option value="Demo Scheduled">Demo Scheduled</option>
                    <option value="Proposal Review">Proposal Review</option>
                    <option value="Kickoff Call">Kickoff Call</option>
                    <option value="Payment Follow-up">Payment Follow-up</option>
                    <option value="Outreach Touchpoint">Outreach Touchpoint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Status</label>
                  <select
                    value={quickMeetingStatus}
                    onChange={(e) => setQuickMeetingStatus(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-typography text-white py-2.5 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Schedule & Sync
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

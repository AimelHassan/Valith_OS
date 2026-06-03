import React, { useState, useEffect, useRef } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Briefcase,
  CheckSquare,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  Inbox,
  FileDown,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Search,
  Check,
  AlertTriangle,
  Menu,
  X,
  Tag,
  Layers,
  Calendar
} from 'lucide-react';


interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    signOut,
    user,
    leads,
    tasks,
    payments,
    expenses,
    organizations,
    contacts,
    documents
  } = useValithOS();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Notification States
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; type: 'warning' | 'alert' | 'info'; text: string; tab: string }[]>([]);
  
  // Global Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; title: string; subtitle: string; tab: string; id: string }[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Notifications
  useEffect(() => {
    const list: typeof notifications = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Follow-ups due today
    leads.forEach(l => {
      if (l.next_follow_up_date === todayStr && l.status !== 'Closed' && l.status !== 'Archived') {
        list.push({
          id: `fup-today-${l.id}`,
          type: 'info',
          text: `Follow-up due today with ${l.lead_name}`,
          tab: 'Leads'
        });
      }
    });

    // 2. Overdue follow-up warnings
    leads.forEach(l => {
      if (l.next_follow_up_date && l.next_follow_up_date < todayStr && l.status !== 'Closed' && l.status !== 'Archived') {
        list.push({
          id: `fup-overdue-${l.id}`,
          type: 'warning',
          text: `OVERDUE follow-up: ${l.lead_name} (was due ${l.next_follow_up_date})`,
          tab: 'Leads'
        });
      }
    });

    // 3. Upcoming payment due warnings (in next 7 days)
    payments.forEach(p => {
      if (p.status !== 'Received' && p.status !== 'Cancelled' && p.due_date) {
        const diffTime = new Date(p.due_date).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          list.push({
            id: `pay-due-${p.id}`,
            type: 'alert',
            text: `Payment of ${p.amount.toLocaleString()} ${p.currency} from ${p.client_name} due in ${diffDays} days`,
            tab: 'Finance'
          });
        }
      }
    });

    // 4. Upcoming expense due warnings (in next 7 days)
    expenses.forEach(e => {
      if (e.payment_status !== 'Paid' && e.payment_status !== 'Cancelled' && e.due_date) {
        const diffTime = new Date(e.due_date).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          list.push({
            id: `exp-due-${e.id}`,
            type: 'warning',
            text: `Bill due: ${e.expense_name} (${e.amount.toLocaleString()} ${e.currency}) in ${diffDays} days`,
            tab: 'Expenses'
          });
        }
      }
    });

    setNotifications(list);
  }, [leads, payments, expenses]);

  // Execute Global Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: typeof searchResults = [];

    // Search organizations
    organizations.forEach(o => {
      if (o.name.toLowerCase().includes(query) || (o.notes && o.notes.toLowerCase().includes(query))) {
        results.push({ type: 'Organization', title: o.name, subtitle: o.segment || 'Organization', tab: 'Leads', id: o.id });
      }
    });

    // Search contacts
    contacts.forEach(c => {
      if (c.full_name.toLowerCase().includes(query) || (c.role_title && c.role_title.toLowerCase().includes(query))) {
        results.push({ type: 'Contact', title: c.full_name, subtitle: `${c.role_title || 'Contact'} at Valith CRM`, tab: 'Leads', id: c.id });
      }
    });

    // Search leads
    leads.forEach(l => {
      if (l.lead_name.toLowerCase().includes(query) || (l.notes && l.notes.toLowerCase().includes(query)) || (l.next_action && l.next_action.toLowerCase().includes(query))) {
        results.push({ type: 'Lead', title: l.lead_name, subtitle: `Stage: ${l.stage} | Next: ${l.next_action || 'None'}`, tab: 'Leads', id: l.id });
      }
    });

    // Search documents
    documents.forEach(d => {
      if (d.title.toLowerCase().includes(query) || (d.notes && d.notes.toLowerCase().includes(query))) {
        results.push({ type: 'Document', title: d.title, subtitle: `Type: ${d.document_type} | Status: ${d.status}`, tab: 'Proposals', id: d.id });
      }
    });

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
  }, [searchQuery, organizations, contacts, leads, documents]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Pipeline', icon: Kanban },
    { name: 'Leads', icon: Users },
    { name: 'Calendar', icon: Calendar, label: 'Interaction Calendar' },
    { name: 'Deals', icon: Briefcase },
    { name: 'Offers', icon: Tag },
    { name: 'Segments', icon: Layers },
    { name: 'Tasks', icon: CheckSquare, label: 'Tasks / Follow-ups' },
    { name: 'Finance', icon: DollarSign },
    { name: 'MRR', icon: TrendingUp },
    { name: 'Expenses', icon: Receipt },
    { name: 'Proposals', icon: FileText, label: 'Proposals / Documents' },
    { name: 'AI Capture', icon: Inbox, label: 'AI Capture Inbox' },
    { name: 'Founder Brief', icon: FileDown },
    { name: 'AI Advisor', icon: Sparkles },
    { name: 'Settings', icon: SettingsIcon }
  ];

  const handleSearchSelect = (item: any) => {
    setActiveTab(item.tab);
    setSearchQuery('');
    setSearchFocused(false);
  };

  return (
    <div className="min-h-screen flex bg-background flex-col md:flex-row">
      {/* ----------------- SIDEBAR ----------------- */}
      <aside className="w-full md:w-64 bg-background border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0">
        {/* Brand Banner */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <span className="text-sm font-bold tracking-widest text-typography font-sans">VALITH OS</span>
            <span className="block text-[9px] text-typography-muted font-sans tracking-wide uppercase">AI Automation Hub</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-typography">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className={`flex-1 px-4 py-4 space-y-1 overflow-y-auto md:block ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-medium tracking-wide uppercase font-sans transition-all duration-150 ${
                  isActive
                    ? 'bg-typography text-white'
                    : 'text-typography-muted hover:bg-background-soft hover:text-typography'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-aurum' : ''} />
                <span>{item.label || item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info footer */}
        <div className="p-4 border-t border-border mt-auto hidden md:flex flex-col space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-aurum flex items-center justify-center text-xs font-bold text-typography">
              V
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-semibold text-typography truncate">{user?.email || 'Founder Sandbox'}</span>
              <span className="block text-[9px] text-typography-light font-sans tracking-wider uppercase">
                Supabase Live
              </span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-2 py-2 border border-border rounded text-xs font-medium text-typography-muted hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-sans"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ----------------- MAIN VIEWPORT ----------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border bg-background-card flex items-center justify-between px-6 shrink-0 relative z-30">
          {/* Global Search */}
          <div ref={searchRef} className="relative w-full max-w-sm">
            <div className="flex items-center bg-background-soft rounded-full px-3 py-1.5 border border-transparent focus-within:border-aurum/40 focus-within:bg-background-card transition-all">
              <Search size={14} className="text-typography-light mr-2" />
              <input
                type="text"
                placeholder="Search leads, docs, contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="bg-transparent border-none p-0 text-xs w-full focus:ring-0 focus:border-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[10px] text-typography-light hover:text-typography">
                  Clear
                </button>
              )}
            </div>

            {searchFocused && (searchQuery.trim() || searchResults.length > 0) && (
              <div className="absolute top-11 left-0 right-0 bg-background-card border border-border rounded-lg shadow-premium max-h-72 overflow-y-auto z-40 p-2 space-y-1">
                {searchResults.length === 0 ? (
                  <p className="text-center text-xs text-typography-light py-4">No matching records found.</p>
                ) : (
                  searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearchSelect(item)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-background-soft transition-all flex flex-col"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-typography truncate">{item.title}</span>
                        <span className="text-[8px] uppercase tracking-wider bg-aurum-glow text-aurum-dark px-1.5 py-0.5 rounded">
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-typography-muted truncate mt-0.5">{item.subtitle}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-full hover:bg-background-soft transition-all text-typography-muted hover:text-typography"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute top-10 right-0 w-80 bg-background-card border border-border rounded-lg shadow-premium z-50 p-2 max-h-96 overflow-y-auto">
                <div className="px-3 py-2 border-b border-border flex justify-between items-center mb-1">
                  <span className="text-xs font-bold tracking-wider uppercase text-typography">System Alerts</span>
                  <span className="text-[9px] bg-background-soft text-typography-muted px-1.5 py-0.5 rounded font-bold">
                    {notifications.length}
                  </span>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-typography-light py-6">All systems nominal. No alerts.</p>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          setActiveTab(notif.tab);
                          setNotifDropdownOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded hover:bg-background-soft transition-all flex items-start space-x-2.5"
                      >
                        {notif.type === 'warning' || notif.type === 'alert' ? (
                          <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <Check size={14} className="text-aurum shrink-0 mt-0.5" />
                        )}
                        <span className="text-[11px] text-typography leading-tight font-medium">
                          {notif.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

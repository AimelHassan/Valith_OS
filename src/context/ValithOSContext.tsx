import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { supabase } from '../supabaseClient';
import {
  Organization,
  Contact,
  Lead,
  Deal,
  Task,
  RevenuePayment,
  MRREntry,
  Expense,
  CashAccount,
  DBDocument,
  AICapture,
  Setting,
  Offer,
  Segment
} from '../types/database.types';

interface ValithOSContextType {
  // Data lists
  organizations: Organization[];
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  payments: RevenuePayment[];
  mrrEntries: MRREntry[];
  expenses: Expense[];
  cashAccounts: CashAccount[];
  documents: DBDocument[];
  captures: AICapture[];
  settings: Setting[];
  offers: Offer[];
  segments: Segment[];

  // State flags
  isLoading: boolean;
  errorMsg: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any | null;

  // Operations
  refreshAll: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // Organization Ops
  saveOrganization: (org: Omit<Organization, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;

  // Contact Ops
  saveContact: (contact: Omit<Contact, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;

  // Lead Ops
  saveLead: (lead: Omit<Lead, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;

  // Deal Ops
  saveDeal: (deal: Omit<Deal, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<Deal>;
  deleteDeal: (id: string) => Promise<void>;



  // Task Ops
  saveTask: (task: Omit<Task, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  // Payment Ops
  savePayment: (payment: Omit<RevenuePayment, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<RevenuePayment>;
  deletePayment: (id: string) => Promise<void>;

  // MRR Ops
  saveMRREntry: (mrr: Omit<MRREntry, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<MRREntry>;
  deleteMRREntry: (id: string) => Promise<void>;

  // Expense Ops
  saveExpense: (exp: Omit<Expense, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;

  // Cash Ops
  saveCashAccount: (acc: Omit<CashAccount, 'updated_at' | 'id'> & { id?: string }) => Promise<CashAccount>;
  deleteCashAccount: (id: string) => Promise<void>;

  // Document Ops
  saveDocument: (doc: Omit<DBDocument, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<DBDocument>;
  deleteDocument: (id: string) => Promise<void>;

  // AI Capture Ops
  saveCapture: (cap: Omit<AICapture, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<AICapture>;
  deleteCapture: (id: string) => Promise<void>;

  // Settings Ops
  saveSetting: (key: string, value: string) => Promise<Setting>;

  // Offers Ops
  saveOffer: (offer: Omit<Offer, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<Offer>;
  deleteOffer: (id: string) => Promise<void>;

  // Segments Ops
  saveSegment: (segment: Omit<Segment, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<Segment>;
  deleteSegment: (id: string) => Promise<void>;
}

const ValithOSContext = createContext<ValithOSContextType | undefined>(undefined);

export const ValithOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<RevenuePayment[]>([]);
  const [mrrEntries, setMrrEntries] = useState<MRREntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [documents, setDocuments] = useState<DBDocument[]>([]);
  const [captures, setCaptures] = useState<AICapture[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [user, setUser] = useState<any | null>(null);

  // Authentication & Session
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch all database records
  const refreshAll = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [
        orgData,
        contactData,
        leadData,
        dealData,
        taskData,
        payData,
        mrrData,
        expData,
        cashData,
        docData,
        capData,
        setRecs,
        offerData,
        segmentData
      ] = await Promise.all([
        dbService.getOrganizations(),
        dbService.getContacts(),
        dbService.getLeads(),
        dbService.getDeals(),
        dbService.getTasks(),
        dbService.getPayments(),
        dbService.getMRREntries(),
        dbService.getExpenses(),
        dbService.getCashAccounts(),
        dbService.getDocuments(),
        dbService.getAICaptures(),
        dbService.getSettings(),
        dbService.getOffers(),
        dbService.getSegments()
      ]);

      setOrganizations(orgData);
      setContacts(contactData);
      setLeads(leadData);
      setDeals(dealData);
      setTasks(taskData);
      setPayments(payData);
      setMrrEntries(mrrData);
      setExpenses(expData);
      setCashAccounts(cashData);
      setDocuments(docData);
      setCaptures(capData);
      setSettings(setRecs);
      setOffers(offerData);
      setSegments(segmentData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setErrorMsg(err.message || 'Failed to fetch operating database.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run on user sign in
  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Sign out helper
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ----------------------------------------------------
  // WRAPPERS FOR MUTATION ACTIONS
  // ----------------------------------------------------

  const saveOrganization = async (org: any) => {
    const updated = await dbService.saveOrganization(org);
    setOrganizations(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteOrganization = async (id: string) => {
    await dbService.deleteOrganization(id);
    setOrganizations(prev => prev.filter(item => item.id !== id));
  };

  const saveContact = async (contact: any) => {
    const updated = await dbService.saveContact(contact);
    setContacts(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteContact = async (id: string) => {
    await dbService.deleteContact(id);
    setContacts(prev => prev.filter(item => item.id !== id));
  };

  const saveLead = async (lead: any) => {
    const updated = await dbService.saveLead(lead);
    setLeads(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    // Create/update matching deal if stage changes to Won/Lost or Estimates exist
    return updated;
  };

  const deleteLead = async (id: string) => {
    await dbService.deleteLead(id);
    setLeads(prev => prev.filter(item => item.id !== id));
  };

  const saveDeal = async (deal: any) => {
    const updated = await dbService.saveDeal(deal);
    setDeals(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteDeal = async (id: string) => {
    await dbService.deleteDeal(id);
    setDeals(prev => prev.filter(item => item.id !== id));
  };



  const saveTask = async (task: any) => {
    const updated = await dbService.saveTask(task);
    setTasks(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteTask = async (id: string) => {
    await dbService.deleteTask(id);
    setTasks(prev => prev.filter(item => item.id !== id));
  };

  const savePayment = async (payment: any) => {
    const updated = await dbService.savePayment(payment);
    setPayments(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deletePayment = async (id: string) => {
    await dbService.deletePayment(id);
    setPayments(prev => prev.filter(item => item.id !== id));
  };

  const saveMRREntry = async (mrr: any) => {
    const updated = await dbService.saveMRREntry(mrr);
    setMrrEntries(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteMRREntry = async (id: string) => {
    await dbService.deleteMRREntry(id);
    setMrrEntries(prev => prev.filter(item => item.id !== id));
  };

  const saveExpense = async (exp: any) => {
    const updated = await dbService.saveExpense(exp);
    setExpenses(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteExpense = async (id: string) => {
    await dbService.deleteExpense(id);
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  const saveCashAccount = async (acc: any) => {
    const updated = await dbService.saveCashAccount(acc);
    setCashAccounts(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteCashAccount = async (id: string) => {
    await dbService.deleteCashAccount(id);
    setCashAccounts(prev => prev.filter(item => item.id !== id));
  };

  const saveDocument = async (doc: any) => {
    const updated = await dbService.saveDocument(doc);
    setDocuments(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteDocument = async (id: string) => {
    await dbService.deleteDocument(id);
    setDocuments(prev => prev.filter(item => item.id !== id));
  };

  const saveCapture = async (cap: any) => {
    const updated = await dbService.saveAICapture(cap);
    setCaptures(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteCapture = async (id: string) => {
    await dbService.deleteAICapture(id);
    setCaptures(prev => prev.filter(item => item.id !== id));
  };

  const saveSetting = async (key: string, value: string) => {
    const updated = await dbService.saveSetting(key, value);
    setSettings(prev => {
      const idx = prev.findIndex(item => item.key === key);
      return idx >= 0 ? prev.map(item => item.key === key ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const saveOffer = async (offer: any) => {
    const updated = await dbService.saveOffer(offer);
    setOffers(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteOffer = async (id: string) => {
    await dbService.deleteOffer(id);
    setOffers(prev => prev.filter(item => item.id !== id));
  };

  const saveSegment = async (segment: any) => {
    const updated = await dbService.saveSegment(segment);
    setSegments(prev => {
      const idx = prev.findIndex(item => item.id === updated.id);
      return idx >= 0 ? prev.map(item => item.id === updated.id ? updated : item) : [...prev, updated];
    });
    return updated;
  };

  const deleteSegment = async (id: string) => {
    await dbService.deleteSegment(id);
    setSegments(prev => prev.filter(item => item.id !== id));
  };

  return (
    <ValithOSContext.Provider
      value={{
        organizations,
        contacts,
        leads,
        deals,
        tasks,
        payments,
        mrrEntries,
        expenses,
        cashAccounts,
        documents,
        captures,
        settings,
        offers,
        segments,
        isLoading,
        errorMsg,
        activeTab,
        setActiveTab,
        user,
        refreshAll,
        signOut,
        saveOrganization,
        deleteOrganization,
        saveContact,
        deleteContact,
        saveLead,
        deleteLead,
        saveDeal,
        deleteDeal,
        saveTask,
        deleteTask,
        savePayment,
        deletePayment,
        saveMRREntry,
        deleteMRREntry,
        saveExpense,
        deleteExpense,
        saveCashAccount,
        deleteCashAccount,
        saveDocument,
        deleteDocument,
        saveCapture,
        deleteCapture,
        saveSetting,
        saveOffer,
        deleteOffer,
        saveSegment,
        deleteSegment
      }}
    >
      {children}
    </ValithOSContext.Provider>
  );
};

export const useValithOS = () => {
  const context = useContext(ValithOSContext);
  if (context === undefined) {
    throw new Error('useValithOS must be used within a ValithOSProvider');
  }
  return context;
};

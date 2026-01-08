import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
    Plus, X, Hash, Search, Maximize2, Minimize2, Share2, MoreHorizontal, LayoutGrid, List, Disc, Trash2, 
    ChevronRight, ChevronDown, GitBranch, Sparkles, Eye, EyeOff, CornerDownRight, Move, Palette, Check, 
    ZoomIn, ZoomOut, RotateCcw, GripVertical, FileText, Pencil, Settings, Download, Upload, Monitor, Activity, Moon,
    Bold, Italic, ListOrdered, Image as ImageIcon, Link as LinkIcon, Code as CodeIcon, Quote as QuoteIcon, Heading1, HelpCircle, Grid, Tag, Wand2, Bot, Shield, FileText as FileTextIcon
} from 'lucide-react';

/**
 * ECHO ARCHIVE v3.6 (Minimal Legal Implementation)
 * Features:
 * - ⚖️ Legal: Minimal Impressum (Name/Email) + Privacy Policy
 * - 🌍 Deployment: configured for VITE_GEMINI_API_KEY
 * - ✨ AI: Auto-Tag, Smart Continue, Summarize
 */

// --- Config: Palettes ---
const NEON_PALETTE = [
  '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#f43f5e', 
  '#ef4444', '#eab308', '#84cc16', '#3b82f6', '#d946ef', 
  '#6366f1', '#14b8a6', '#f97316', '#ec4899', '#a855f7', 
];

const INITIAL_TAG_COLORS = {
  'work': '#f59e0b',
  'private': '#8b5cf6',
  'school': '#10b981',
  'tech': '#06b6d4',
  'idea': '#f43f5e',
  'default': '#737373'
};

const DEFAULT_SETTINGS = {
    ambience: 'grid', 
    animations: true,
    showGrid: true
};

// --- GEMINI API HELPER ---
const callGeminiAPI = async (prompt) => {
    // Lädt den API Key sicher aus den Netlify-Einstellungen
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

    if (!apiKey) {
        console.warn("⚠️ API Key missing. Please configure VITE_GEMINI_API_KEY in your deployment settings.");
        return null;
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );
        
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return null;
    }
};

// --- Custom Markdown Components ---
const MarkdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-3xl font-light mb-6 mt-2 text-cyan-400 border-b border-white/10 pb-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-light mb-4 mt-8 text-violet-400" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-medium mb-3 mt-6 text-white" {...props} />,
    p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-300" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-300 marker:text-cyan-500/50" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-300 marker:text-cyan-500/50" {...props} />,
    li: ({node, ...props}) => <li className="pl-1" {...props} />,
    a: ({node, ...props}) => <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-cyan-500/50 pl-4 py-1 my-6 italic text-gray-400 bg-white/5 rounded-r-lg" {...props} />,
    code: ({node, inline, ...props}) => inline 
        ? <code className="bg-white/10 rounded px-1.5 py-0.5 font-mono text-sm text-cyan-200" {...props} />
        : <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 my-4 overflow-x-auto"><code className="font-mono text-sm text-gray-300 block" {...props} /></div>,
    img: ({node, ...props}) => <img className="rounded-lg border border-white/10 my-6 w-full object-cover max-h-[500px]" {...props} />,
    table: ({node, ...props}) => <div className="overflow-x-auto my-6 border border-white/10 rounded-lg"><table className="w-full text-left text-sm" {...props} /></div>,
    thead: ({node, ...props}) => <thead className="bg-white/5 text-gray-200" {...props} />,
    th: ({node, ...props}) => <th className="px-4 py-3 font-medium border-b border-white/10" {...props} />,
    td: ({node, ...props}) => <td className="px-4 py-3 border-b border-white/5 text-gray-400" {...props} />,
    hr: ({node, ...props}) => <hr className="border-white/10 my-8" {...props} />,
};

const getCategoryColor = (tags, colorMap) => {
  if (!tags || tags.length === 0) return colorMap['default'];
  const mainTag = tags.find(t => {
      const root = t.split('/')[0];
      return colorMap[root];
  });
  const root = mainTag ? mainTag.split('/')[0] : 'default';
  return colorMap[root] || colorMap['default'];
};

const generateInitialNotes = () => [
  { id: '1', title: 'Welcome to Echo', content: '# Echo Archive\n\nReady for Launch! 🚀\n\n## Next Steps\n1. Go to Settings (Gear Icon)\n2. Open "Impressum"\n3. Check if your Name/Email is correct.\n\nAI Features are active and connected to the cloud.', x: 50, y: 50, tags: ['idea', 'welcome'] }
];

// --- LEGAL TEXTS CONSTANTS ---
// ⬇️⬇️⬇️ HIER DEINE DATEN EINTRAGEN ⬇️⬇️⬇️
const LEGAL_TEXTS = {
    impressum: `
# Impressum

## Betreiber der Seite
[Calvin] [Lieberenz]

## Kontakt
E-Mail: [mail@clieberenz]

## Redaktionell verantwortlich
[Calvin] [Lieberenz]

## Hinweis
Dies ist ein privates, nicht-kommerzielles Projekt zu Demonstrationszwecken.
Es werden keine Einnahmen erzielt.
    `,
    privacy: `
# Datenschutzerklärung

## 1. Datenschutz auf einen Blick
**Allgemeine Hinweise**
Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.

## 2. Hosting (Netlify)
Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
**Netlify**
Anbieter ist die Netlify, Inc., 2325 3rd Street, Suite 215, San Francisco, California 94107, USA.
Wenn Sie unsere Website besuchen, erfasst Netlify verschiedene Logfiles inklusive Ihrer IP-Adressen.
Die Verwendung von Netlify erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website.

## 3. KI-Funktionen (Google Gemini API)
Diese Anwendung nutzt Funktionen der Google Gemini API zur Textgenerierung und -analyse. 
Anbieter ist Google Ireland Limited ("Google"), Gordon House, Barrow Street, Dublin 4, Irland.

**Funktionsweise:**
Wenn Sie die KI-Funktionen (z.B. "Auto-Tagging", "Zusammenfassen", "Weiterschreiben") aktiv durch Klicken eines Buttons nutzen, wird der Inhalt der aktuell geöffneten Notiz an die Server von Google gesendet, um die gewünschte Antwort zu generieren.

**Datenverarbeitung:**
Die Übermittlung erfolgt nur auf Ihre explizite Anforderung hin. Es werden keine personenbezogenen Daten dauerhaft gespeichert, sofern diese nicht im Text der Notiz selbst enthalten sind. Wir empfehlen, keine sensiblen persönlichen Daten in die Notizen einzugeben, wenn Sie die KI-Funktionen nutzen möchten.
    `
};

// --- AMBIENT BACKGROUND ---
const AmbientBackground = ({ mode, pan, zoom }) => {
    if (mode === 'grid' || mode === 'nebula') {
        const gridSize = 40 * zoom;
        const bgPos = `${pan.x}px ${pan.y}px`;
        return (
            <div className="absolute inset-0 pointer-events-none z-0 bg-[#050505] overflow-hidden">
                <div 
                    className="absolute inset-0 opacity-20 transition-none"
                    style={{
                        backgroundImage: 'radial-gradient(#4b5563 1.5px, transparent 1.5px)',
                        backgroundSize: `${gridSize}px ${gridSize}px`,
                        backgroundPosition: bgPos,
                        willChange: 'background-position, background-size'
                    }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] pointer-events-none" />
            </div>
        );
    }
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#050505]">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/10 to-[#050505]" />
        </div>
    );
};

// --- LEGAL MODAL ---
const LegalModal = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;
    const content = type === 'impressum' ? LEGAL_TEXTS.impressum : LEGAL_TEXTS.privacy;
    const title = type === 'impressum' ? 'Impressum' : 'Privacy Policy';
    
    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0A0A0A] sticky top-0 z-10">
                    <h2 className="text-xl font-light text-white flex items-center gap-2">
                        <Shield size={20} className="text-cyan-400" /> {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-cyan-100 prose-p:text-gray-400">
                        <ReactMarkdown children={content} />
                    </div>
                </div>
                <div className="p-4 border-t border-white/10 bg-[#0A0A0A] text-center text-xs text-gray-600">
                    Private Project. Non-Commercial.
                </div>
            </div>
        </div>
    );
};

// --- SETTINGS MODAL ---
const SettingsModal = ({ isOpen, onClose, settings, setSettings, onExport, onImport, onReset, onOpenLegal }) => {
    if (!isOpen) return null;
    const fileInputRef = useRef(null);
    const handleImportClick = () => fileInputRef.current?.click();
    const handleFileChange = (e) => { const file = e.target.files[0]; if (file) onImport(file); };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                <h2 className="text-xl font-light text-white mb-6 flex items-center gap-2"><Settings size={20} className="text-cyan-400" /> Settings</h2>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Appearance</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setSettings(s => ({...s, ambience: 'dark'}))} className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${settings.ambience === 'dark' ? 'bg-white/10 border-white/30 text-white' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}><Moon size={16} /> Deep Dark</button>
                            <button onClick={() => setSettings(s => ({...s, ambience: 'grid'}))} className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${(settings.ambience === 'grid' || settings.ambience === 'nebula') ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-300' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}><Grid size={16} /> Grid</button>
                        </div>
                    </div>
                    
                    {/* LEGAL SECTION */}
                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Legal & Info</h3>
                        <div className="flex gap-2">
                            <button onClick={() => onOpenLegal('impressum')} className="flex-1 py-2 px-3 rounded-lg border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 text-xs">
                                <FileTextIcon size={14} /> Impressum
                            </button>
                            <button onClick={() => onOpenLegal('privacy')} className="flex-1 py-2 px-3 rounded-lg border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 text-xs">
                                <Shield size={14} /> Privacy
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Data Management</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={onExport} className="py-2 px-3 rounded-lg border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 text-xs"><Download size={14} /> Backup</button>
                            <button onClick={handleImportClick} className="py-2 px-3 rounded-lg border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 text-xs"><Upload size={14} /> Restore</button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                        </div>
                        <button onClick={onReset} className="w-full py-2 px-3 rounded-lg border border-red-900/30 bg-red-900/10 text-red-500 hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 text-xs mt-2"><RotateCcw size={14} /> Reset Universe</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MARKDOWN HELP COMPONENT ---
const MarkdownHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const items = [
        { label: 'Heading 1', syntax: '# Text' },
        { label: 'Bold', syntax: '**Text**' },
        { label: 'Italic', syntax: '*Text*' },
        { label: 'List', syntax: '- Item' },
        { label: 'Link', syntax: '[Link](url)' },
        { label: 'Image', syntax: '![Alt](url)' },
        { label: 'Code', syntax: '`Code`' },
        { label: 'Quote', syntax: '> Text' },
    ];
    return (
        <div className="absolute right-4 top-14 w-64 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3 flex justify-between items-center">Markdown Guide<button onClick={onClose}><X size={14} className="hover:text-white"/></button></h3>
            <div className="space-y-2">{items.map((item, i) => (<div key={i} className="flex justify-between text-xs text-gray-400 border-b border-white/5 pb-1 last:border-0"><span>{item.label}</span><code className="bg-white/10 px-1 rounded text-cyan-300 font-mono">{item.syntax}</code></div>))}</div>
        </div>
    );
};

const App = () => {
  // --- STATE ---
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('echo-notes');
    return saved ? JSON.parse(saved) : generateInitialNotes();
  });

  const [tagColors, setTagColors] = useState(() => {
      const saved = localStorage.getItem('echo-colors');
      if (saved) return JSON.parse(saved);
      const colors = { ...INITIAL_TAG_COLORS };
      if (!colors['shopping']) colors['shopping'] = NEON_PALETTE[6]; 
      return colors;
  });

  const [settings, setSettings] = useState(() => {
      const saved = localStorage.getItem('echo-settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => { localStorage.setItem('echo-notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('echo-colors', JSON.stringify(tagColors)); }, [tagColors]);
  useEffect(() => { localStorage.setItem('echo-settings', JSON.stringify(settings)); }, [settings]);

  const [activeNoteId, setActiveNoteId] = useState('1'); 
  const [showStarLog, setShowStarLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({}); 
  const [focusedCategory, setFocusedCategory] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50); 
  const isResizingRef = useRef(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const [tagInput, setTagInput] = useState(''); 
  
  // LEGAL & AI STATES
  const [legalModalType, setLegalModalType] = useState(null); // 'impressum' | 'privacy' | null
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(''); 

  // --- COMPUTED ---
  const groupedNotes = useMemo(() => {
    const groups = {};
    notes.forEach(note => {
      let primaryRoot = 'uncategorized';
      const coloredTag = note.tags.find(t => tagColors[t.split('/')[0]]);
      if (coloredTag) primaryRoot = coloredTag.split('/')[0];
      else if (note.tags.length > 0) primaryRoot = note.tags[0].split('/')[0];
      if (!groups[primaryRoot]) groups[primaryRoot] = [];
      groups[primaryRoot].push(note);
    });
    return groups;
  }, [notes, tagColors]);

  const visibleNotes = useMemo(() => {
      return notes.filter(note => {
          if (focusedCategory) {
              const rootTags = note.tags.map(t => t.split('/')[0]);
              if (!rootTags.includes(focusedCategory)) return false;
          }
          if (searchQuery) {
              const q = searchQuery.toLowerCase();
              const matchTitle = note.title.toLowerCase().includes(q);
              const matchContent = note.content.toLowerCase().includes(q);
              const matchTags = note.tags.some(t => t.toLowerCase().includes(q));
              if (!matchTitle && !matchContent && !matchTags) return false;
          }
          return true;
      });
  }, [notes, focusedCategory, searchQuery]);

  const visibleConnections = useMemo(() => {
    const links = [];
    const noteIds = new Set(visibleNotes.map(n => n.id)); 
    for (let i = 0; i < visibleNotes.length; i++) {
      for (let j = i + 1; j < visibleNotes.length; j++) {
        const n1 = visibleNotes[i];
        const n2 = visibleNotes[j];
        const exactMatch = n1.tags.some(t1 => n2.tags.includes(t1));
        const rootMatch = n1.tags.some(t1 => n2.tags.some(t2 => t1.split('/')[0] === t2.split('/')[0]));
        if (exactMatch || rootMatch) {
          links.push({ source: n1, target: n2, type: exactMatch ? 'exact' : 'root' });
        }
      }
    }
    return links;
  }, [visibleNotes]);

  const connectedNodeIds = useMemo(() => {
      if (!activeNoteId) return new Set();
      const ids = new Set();
      visibleConnections.forEach(link => {
          if (link.source.id === activeNoteId) ids.add(link.target.id);
          if (link.target.id === activeNoteId) ids.add(link.source.id);
      });
      return ids;
  }, [activeNoteId, visibleConnections]);

  const activeNote = notes.find(n => n.id === activeNoteId);
  const activeRootCategory = activeNote?.tags[0] ? activeNote.tags[0].split('/')[0] : 'default';

  // --- HANDLERS ---
  const handleMouseDown = (e) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      hasDraggedRef.current = false;
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleMouseMove = (e) => {
      if (isResizingRef.current) {
          const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
          setEditorWidth(Math.min(Math.max(newWidth, 20), 80));
          return;
      }
      if (!isDragging) return;
      e.preventDefault();
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      const delta = Math.sqrt(Math.pow(newX - pan.x, 2) + Math.pow(newY - pan.y, 2));
      if (delta > 2) hasDraggedRef.current = true;
      setPan({ x: newX, y: newY });
  };
  const handleMouseUp = () => { setIsDragging(false); isResizingRef.current = false; };
  const handleResizeStart = (e) => { e.stopPropagation(); isResizingRef.current = true; };
  const handleWheel = (e) => {
      const scaleAmount = -e.deltaY * 0.001;
      const newZoom = Math.min(Math.max(zoom + scaleAmount, 0.1), 8);
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const worldX = (mouseX - pan.x) / zoom;
      const worldY = (mouseY - pan.y) / zoom;
      const newPanX = mouseX - worldX * newZoom;
      const newPanY = mouseY - worldY * newZoom;
      setPan({ x: newPanX, y: newPanY });
      setZoom(newZoom);
  };
  const handleBackgroundClick = (e) => {
      if (!hasDraggedRef.current) {
          setActiveNoteId(null);
          setColorPickerOpen(false);
          setShowMarkdownHelp(false);
      }
  };
  const resetView = () => { setPan({ x: 0, y: 0 }); setZoom(1); };

  const handleUpdateNote = (id, field, value) => {
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        const updated = { ...note, [field]: value };
        if (field === 'content') {
            const extractedTags = (value.match(/#[a-zA-Z0-9äöüÄÖÜß\/]+/g) || []).map(t => t.substring(1).toLowerCase());
            const mergedTags = [...new Set([...note.tags, ...extractedTags])];
            updated.tags = mergedTags;
            extractedTags.forEach(tag => {
                const root = tag.split('/')[0];
                if (!tagColors[root] && root !== 'uncategorized') {
                    const randomColor = NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)];
                    setTagColors(prev => ({ ...prev, [root]: randomColor }));
                }
            });
        }
        return updated;
      }
      return note;
    }));
  };

  const handleAddTag = (e) => {
      if (e.key === 'Enter' && tagInput.trim()) {
          e.preventDefault();
          const cleanTag = tagInput.trim().toLowerCase().replace(/^#/, ''); 
          const root = cleanTag.split('/')[0];
          if (!tagColors[root] && root !== 'uncategorized') {
               const randomColor = NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)];
               setTagColors(prev => ({ ...prev, [root]: randomColor }));
          }
          setNotes(prev => prev.map(n => {
              if (n.id === activeNoteId) {
                  return { ...n, tags: [...new Set([...n.tags, cleanTag])] };
              }
              return n;
          }));
          setTagInput('');
      }
  };

  const handleRemoveTag = (tagToRemove) => {
      setNotes(prev => prev.map(n => {
          if (n.id === activeNoteId) {
              return { ...n, tags: n.tags.filter(t => t !== tagToRemove) };
          }
          return n;
      }));
  };

  // --- GEMINI FUNCTIONS ---
  
  const handleAiAutoTag = async () => {
      if (!activeNote || !activeNote.content.trim()) return;
      setIsAiLoading(true);
      setAiStatus('tagging');
      
      const prompt = `Analyze the following text and generate 3 to 5 relevant tags. 
      Format the output ONLY as a comma-separated list of tags in "category/subcategory" format (lowercase).
      Example output: "work/meeting, tech/ai, planning/2024".
      Do not include explanations or numbering.
      
      Text to analyze:
      "${activeNote.content.substring(0, 1000)}..."`; 

      const result = await callGeminiAPI(prompt);
      
      if (result) {
          const newTags = result.split(',').map(t => t.trim().toLowerCase().replace(/['"`]/g, ''));
          newTags.forEach(tag => {
              const root = tag.split('/')[0];
              if (!tagColors[root] && root !== 'uncategorized') {
                  setTagColors(prev => ({ ...prev, [root]: NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)] }));
              }
          });
          
          setNotes(prev => prev.map(n => {
              if (n.id === activeNoteId) {
                  return { ...n, tags: [...new Set([...n.tags, ...newTags])] };
              }
              return n;
          }));
      }
      setIsAiLoading(false);
      setAiStatus('');
  };

  const handleAiContinue = async () => {
      if (!activeNote) return;
      setIsAiLoading(true);
      setAiStatus('writing');
      
      const prompt = `Continue the following note naturally. Maintain the tone and style. 
      Add about 2-3 sentences or a bullet point list if appropriate.
      
      Current Note Content:
      "${activeNote.content}"`;

      const result = await callGeminiAPI(prompt);
      
      if (result) {
          const newContent = activeNote.content + (activeNote.content.endsWith('\n') ? '' : '\n\n') + result;
          handleUpdateNote(activeNote.id, 'content', newContent);
      }
      setIsAiLoading(false);
      setAiStatus('');
  };

  const handleAiSummarize = async () => {
      if (!activeNote) return;
      setIsAiLoading(true);
      setAiStatus('summarizing');
      
      const prompt = `Summarize the following text into a concise abstract (max 2 sentences).
      
      Text:
      "${activeNote.content}"`;

      const result = await callGeminiAPI(prompt);
      
      if (result) {
          const summaryBlock = `> **Abstract:** ${result}\n\n`;
          const newContent = summaryBlock + activeNote.content;
          handleUpdateNote(activeNote.id, 'content', newContent);
      }
      setIsAiLoading(false);
      setAiStatus('');
  };

  const handleInsertMarkdown = (prefix, suffix = '') => {
      if (!textareaRef.current || !activeNote) return;
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = activeNote.content;
      const newText = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end);
      handleUpdateNote(activeNote.id, 'content', newText);
      setTimeout(() => textareaRef.current.focus(), 0);
  };

  const handleColorChange = (category, newColor) => { setTagColors(prev => ({ ...prev, [category]: newColor })); };
  const handleDeleteNote = (id) => { setNotes(prev => prev.filter(n => n.id !== id)); setActiveNoteId(null); };
  const handleResetUniverse = () => { if (window.confirm('WARNING: Reset?')) { setNotes(generateInitialNotes()); resetView(); setActiveNoteId('1'); setFocusedCategory(null); setShowSettings(false); }};
  const handleExportData = () => { const dataStr = JSON.stringify({notes, tagColors}, null, 2); const blob = new Blob([dataStr], {type: "application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `echo_backup_${new Date().toISOString().slice(0,10)}.json`; a.click(); };
  const handleImportData = (file) => { const reader = new FileReader(); reader.onload = (e) => { try { const data = JSON.parse(e.target.result); if (data.notes) setNotes(data.notes); if (data.tagColors) setTagColors(data.tagColors); setShowSettings(false); alert("Restored."); } catch (err) { alert("Invalid file."); }}; reader.readAsText(file); };
  const handleDeleteCategory = (category, e) => { e.stopPropagation(); if (window.confirm(`Delete ${category}?`)) { setNotes(prev => prev.filter(n => { let primaryRoot = 'uncategorized'; const coloredTag = n.tags.find(t => tagColors[t.split('/')[0]]); if (coloredTag) primaryRoot = coloredTag.split('/')[0]; else if (n.tags.length > 0) primaryRoot = n.tags[0].split('/')[0]; return primaryRoot !== category; })); if (focusedCategory === category) setFocusedCategory(null); }};
  const handleCreateRootNote = () => { const newId = Date.now().toString(); let gravityX = 50; let gravityY = 50; if (notes.length > 0) { const sumX = notes.reduce((acc, n) => acc + n.x, 0); const sumY = notes.reduce((acc, n) => acc + n.y, 0); gravityX = sumX / notes.length; gravityY = sumY / notes.length; } const angle = Math.random() * Math.PI * 2; const distance = 30 + Math.random() * 30; const newX = gravityX + Math.cos(angle) * distance; const newY = gravityY + Math.sin(angle) * distance; const newNote = { id: newId, title: 'Untitled Root', content: 'New topic... #idea', x: newX, y: newY, tags: ['idea'] }; setNotes([...notes, newNote]); setActiveNoteId(newId); };
  const handleCreateLinkedNote = (parentNote) => { const newId = Date.now().toString(); const inheritedTags = [...parentNote.tags]; const tagsString = inheritedTags.map(t => `#${t}`).join(' '); const newX = parentNote.x + (Math.random() * 30 - 15); const newY = parentNote.y + (Math.random() * 30 - 15); const newNote = { id: newId, title: 'Linked Note', content: `Related to "${parentNote.title}"...\n\n${tagsString}`, x: newX, y: newY, tags: inheritedTags }; setNotes([...notes, newNote]); setActiveNoteId(newId); };
  const toggleGroupCollapse = (group) => setCollapsedGroups(prev => ({...prev, [group]: !prev[group]}));
  const toggleCategoryFocus = (category, e) => { e.stopPropagation(); setFocusedCategory(prev => prev === category ? null : category); };
  const handleOpenLegal = (type) => { setLegalModalType(type); };

  // --- RENDER ---
  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] text-gray-300 font-sans overflow-hidden selection:bg-white/20 selection:text-white overscroll-none touch-none" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <AmbientBackground mode={settings.ambience} pan={pan} zoom={zoom} />
      
      {/* MODALS */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        settings={settings} 
        setSettings={setSettings} 
        onExport={handleExportData} 
        onImport={handleImportData} 
        onReset={handleResetUniverse} 
        onOpenLegal={handleOpenLegal}
      />
      
      <LegalModal 
        isOpen={!!legalModalType} 
        onClose={() => setLegalModalType(null)} 
        type={legalModalType} 
      />

      {/* HUD & GRAPH */}
      <div className="absolute top-0 bottom-0 left-0 transition-all duration-75 ease-out z-10" style={{ width: activeNoteId ? `${100 - editorWidth}%` : '100%' }}>
        <div className="absolute top-6 left-6 z-30 flex flex-col items-start gap-4 pointer-events-none">
          <div>
            <h1 className="text-base tracking-[0.2em] font-bold text-gray-500 uppercase flex items-center gap-3">Echo Archive</h1>
            {focusedCategory && <div className="mt-2 text-xs font-mono text-cyan-400 flex items-center gap-2 animate-pulse"><Eye size={12} /> FOCUS: {focusedCategory.toUpperCase()}</div>}
            <div className="flex items-center gap-4 mt-2 pointer-events-auto">{(pan.x !== 0 || pan.y !== 0 || zoom !== 1) && <button onClick={resetView} className="text-xs font-mono text-gray-500 hover:text-white flex items-center gap-2 transition-colors"><Move size={12} /> RESET ({Math.round(zoom * 100)}%)</button>}</div>
          </div>
          <div className="pointer-events-auto flex flex-col gap-3 mt-3 w-80">
             <div className="relative group w-full backdrop-blur-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-white transition-colors" />
                <input type="text" placeholder="Search universe..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all placeholder:text-gray-700" />
             </div>
             <div className="flex gap-2">
                <button onClick={() => setShowStarLog(!showStarLog)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg backdrop-blur-md border transition-all duration-300 group ${showStarLog ? 'bg-white/10 border-white/20 text-white' : 'bg-black/20 border-white/5 text-gray-500 hover:text-gray-300'}`}><List size={16} /> <span className="text-xs font-medium tracking-wide">LOG</span></button>
                <button onClick={handleCreateRootNote} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg backdrop-blur-md border border-white/5 bg-black/20 text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-300"><Plus size={16} /> <span className="text-xs font-medium tracking-wide">NEW</span></button>
                <button onClick={() => setShowSettings(true)} className="flex items-center justify-center px-4 py-2.5 rounded-lg backdrop-blur-md border border-white/5 bg-black/20 text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-300" title="Settings"><Settings size={16} /></button>
             </div>
          </div>
        </div>
        <div className={`absolute top-56 left-6 bottom-6 w-80 z-30 pointer-events-auto transition-all duration-500 origin-left ${showStarLog ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-5 pb-20">
                {Object.entries(groupedNotes).map(([rootTag, groupNotes]) => {
                    const isCollapsed = collapsedGroups[rootTag]; const isFocused = focusedCategory === rootTag; const groupColor = tagColors[rootTag] || tagColors.default;
                    const subGroups = groupNotes.reduce((acc, note) => { const matchingTag = note.tags.find(t => t.startsWith(rootTag)); let subCategory = '__general__'; if (matchingTag) { const parts = matchingTag.split('/'); if (parts.length > 1) subCategory = parts[1]; } if (!acc[subCategory]) acc[subCategory] = []; acc[subCategory].push(note); return acc; }, {});
                    const sortedSubKeys = Object.keys(subGroups).sort((a, b) => { if (a === '__general__') return -1; if (b === '__general__') return 1; return a.localeCompare(b); });
                    return (
                        <div key={rootTag} className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <div onClick={() => toggleGroupCollapse(rootTag)} className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer border transition-all duration-300 group ${isFocused ? 'bg-white/10 border-white/20' : 'hover:bg-white/5 border-transparent hover:border-white/5'}`}>
                                <div className="flex items-center gap-3"><ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} /><h3 className="text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{color: groupColor}}>{rootTag} <span className="text-gray-600 text-[10px] font-normal">({groupNotes.length})</span></h3></div>
                                <div className="flex items-center gap-1"><button onClick={(e) => toggleCategoryFocus(rootTag, e)} className={`p-1.5 rounded-full transition-all ${isFocused ? 'bg-white/20 text-white' : 'text-gray-600 hover:text-white hover:bg-white/10'}`}>{isFocused ? <Eye size={12} /> : <EyeOff size={12} />}</button><button onClick={(e) => handleDeleteCategory(rootTag, e)} className="p-1.5 rounded-full text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all" title="Delete Constellation"><Trash2 size={12} /></button></div>
                            </div>
                            <div className={`ml-1 pl-3 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-[800px] opacity-100 mt-2'}`}><div className="border-l border-white/10 pl-2 space-y-3">{sortedSubKeys.map(subKey => (<div key={subKey}>{subKey !== '__general__' && (<div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase mb-1 mt-2"><CornerDownRight size={12} className="opacity-50" /> {subKey}</div>)}<div className={subKey !== '__general__' ? "pl-3 border-l border-white/5 ml-1" : ""}>{subGroups[subKey].map(note => (<button key={note.id} onClick={() => setActiveNoteId(note.id)} className="group/item w-full text-left py-1.5 block"><div className={`text-sm truncate transition-colors ${activeNoteId === note.id ? 'text-white font-medium' : 'text-gray-500 group-hover/item:text-gray-300'}`}>{note.title || 'Untitled'}</div></button>))}</div></div>))}</div></div>
                        </div>
                    );
                })}
            </div>
        </div>
        <div ref={containerRef} onMouseDown={handleMouseDown} onWheel={handleWheel} onClick={handleBackgroundClick} className={`w-full h-full relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
           <GraphView notes={visibleNotes} connections={visibleConnections} activeId={activeNoteId} onSelect={setActiveNoteId} pan={pan} zoom={zoom} isDragging={isDragging} tagColors={tagColors} connectedNodeIds={connectedNodeIds} settings={settings} />
           {!activeNoteId && <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 text-sm font-mono animate-pulse pointer-events-none select-none text-center">{isDragging ? 'SCANNING...' : 'SCROLL TO ZOOM • DRAG TO MOVE'}</div>}
        </div>
      </div>

      {/* EDITOR PANEL */}
      <div className={`absolute top-0 right-0 h-full bg-[#050505] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out z-40`} style={{ width: `${editorWidth}%`, transform: activeNoteId ? 'translateX(0)' : 'translateX(100%)' }}>
        <div className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-cyan-500/20 z-50 group flex items-center justify-center -translate-x-1/2" onMouseDown={handleResizeStart}><div className="h-8 w-1 rounded-full bg-white/20 group-hover:bg-cyan-500/50 transition-colors" /></div>
        {activeNote && (
            <div className="flex flex-col h-full relative">
                <button onClick={() => setActiveNoteId(null)} className="absolute top-1/2 -left-3 -translate-y-1/2 bg-[#050505] border border-white/10 rounded-full p-1.5 text-gray-500 hover:text-white hover:border-white/30 transition-all z-50"><Maximize2 size={14} /></button>
                <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl z-10 relative">
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono relative">
                        <div className="relative">
                            <button onClick={() => setColorPickerOpen(!colorPickerOpen)} className="w-4 h-4 rounded-full hover:scale-125 transition-transform duration-200" style={{ backgroundColor: getCategoryColor(activeNote.tags, tagColors) }} title="Change Category Color" />
                            {colorPickerOpen && (
                                <div className="absolute top-6 left-0 w-48 bg-[#0A0A0A] border border-white/10 rounded-xl p-3 shadow-2xl z-50 grid grid-cols-5 gap-2 animate-in fade-in zoom-in duration-200">
                                    {NEON_PALETTE.map(color => (
                                        <button key={color} onClick={() => handleColorChange(activeRootCategory, color)} className="w-6 h-6 rounded-full border border-white/5 hover:scale-110 transition-transform flex items-center justify-center" style={{ backgroundColor: color }}>
                                            {tagColors[activeRootCategory] === color && <Check size={12} className="text-black/50 stroke-[3]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className="uppercase tracking-wider text-sm">{activeRootCategory}</span>
                    </div>
                    <div className="flex items-center gap-3">
                         {/* GEMINI SUMMARIZE BUTTON */}
                        <button 
                            onClick={handleAiSummarize} 
                            disabled={isAiLoading}
                            className={`p-2 rounded-md transition-all mr-2 flex items-center gap-2 border ${isAiLoading && aiStatus === 'summarizing' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 animate-pulse' : 'bg-transparent border-transparent text-gray-500 hover:text-cyan-400 hover:bg-cyan-900/10'}`} 
                            title="AI Summarize Note"
                        >
                            {isAiLoading && aiStatus === 'summarizing' ? <Bot size={16} className="animate-spin" /> : <Bot size={16} />}
                            <span className="text-xs font-medium">ABSTRACT</span>
                        </button>
                        
                        <div className="h-4 w-px bg-white/10 mx-1" />

                        <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`p-2 rounded-md transition-colors mr-2 flex items-center gap-2 ${isPreviewMode ? 'bg-cyan-900/30 text-cyan-400' : 'text-gray-500 hover:text-white'}`} title={isPreviewMode ? "Switch to Edit" : "Switch to Preview"}>{isPreviewMode ? <Eye size={16} /> : <Pencil size={16} />}<span className="text-xs font-medium">{isPreviewMode ? 'PREVIEW' : 'EDIT'}</span></button>
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <button onClick={() => handleDeleteNote(activeNote.id)} className="p-2.5 hover:bg-red-500/10 rounded-md text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        <button onClick={() => handleCreateLinkedNote(activeNote)} className="bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-900/30 px-4 py-2 rounded text-xs font-medium text-cyan-400 hover:text-cyan-200 transition-all flex items-center gap-2"><GitBranch size={14} /> LINK NEW</button>
                        <button onClick={handleCreateRootNote} className="bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded text-xs font-medium text-gray-400 hover:text-white transition-all flex items-center gap-2"><Plus size={14} /> NEW ROOT</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-12 py-12 custom-scrollbar">
                    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <input value={activeNote.title} onChange={(e) => handleUpdateNote(activeNote.id, 'title', e.target.value)} className="w-full bg-transparent text-4xl font-light text-white placeholder:text-gray-800 focus:outline-none" placeholder="Untitled Note" />
                        
                        {/* TAG INPUT AREA */}
                        <div className="flex flex-wrap gap-2 items-center">
                            {activeNote.tags.map(tag => {
                                const parts = tag.split('/');
                                const root = parts[0];
                                const color = tagColors[root] || tagColors.default;
                                return (
                                    <span key={tag} style={{ borderColor: `${color}33`, color: color, backgroundColor: `${color}08` }} className="px-3 py-1 rounded text-xs font-mono border flex items-center gap-1.5 uppercase tracking-wider group cursor-default">
                                        <Hash size={10} className="opacity-50" />
                                        {parts.map((part, index) => (
                                            <React.Fragment key={index}>
                                                {index > 0 && <ChevronRight size={10} className="opacity-50 mx-0.5" />}
                                                <span className={index === parts.length - 1 ? "font-bold" : "opacity-70"}>{part}</span>
                                            </React.Fragment>
                                        ))}
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }} className="ml-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"><X size={10} /></button>
                                    </span>
                                )
                            })}
                            
                            <div className="relative flex items-center group">
                                <Tag size={12} className="absolute left-2 text-gray-600 group-focus-within:text-cyan-500 transition-colors" />
                                <input 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Add tag (e.g. school/math)" 
                                    className="bg-white/5 hover:bg-white/10 focus:bg-black border border-transparent focus:border-cyan-900/50 rounded-full py-1 pl-7 pr-3 text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all w-48"
                                />
                            </div>

                            {/* GEMINI AUTO TAG BUTTON */}
                            <button 
                                onClick={handleAiAutoTag}
                                disabled={isAiLoading}
                                className={`ml-1 p-1.5 rounded-full transition-all border ${isAiLoading && aiStatus === 'tagging' ? 'border-purple-500 bg-purple-500/20 text-purple-300 animate-pulse' : 'border-white/5 bg-white/5 text-gray-500 hover:text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10'}`}
                                title="AI Auto-Tagging"
                            >
                                <Sparkles size={12} />
                            </button>
                        </div>
                        
                        <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent my-6" />
                        
                        {/* MARKDOWN TOOLBAR & HELP */}
                        {!isPreviewMode && (
                            <div className="flex items-center gap-2 mb-4 bg-white/5 p-2 rounded-lg w-fit border border-white/5 relative">
                                <button onClick={() => handleInsertMarkdown('**', '**')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Bold"><Bold size={16}/></button>
                                <button onClick={() => handleInsertMarkdown('*', '*')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Italic"><Italic size={16}/></button>
                                <button onClick={() => handleInsertMarkdown('# ')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Heading"><Heading1 size={16}/></button>
                                <button onClick={() => handleInsertMarkdown('- ')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="List"><ListOrdered size={16}/></button>
                                <button onClick={() => handleInsertMarkdown('> ')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Quote"><QuoteIcon size={16}/></button>
                                <button onClick={() => handleInsertMarkdown('`', '`')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Code"><CodeIcon size={16}/></button>
                                <button onClick={() => handleInsertMarkdown('[', '](url)')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Link"><LinkIcon size={16}/></button>
                                <button onClick={() => handleInsertMarkdown('![', '](url)')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Image"><ImageIcon size={16}/></button>
                                
                                <div className="h-4 w-px bg-white/10 mx-1" />
                                
                                {/* GEMINI SMART CONTINUE BUTTON */}
                                <button 
                                    onClick={handleAiContinue} 
                                    disabled={isAiLoading}
                                    className={`p-1.5 rounded transition-all flex items-center gap-1 ${isAiLoading && aiStatus === 'writing' ? 'text-green-400 bg-green-900/20 animate-pulse' : 'text-gray-400 hover:text-green-400 hover:bg-green-900/10'}`} 
                                    title="AI Smart Continue"
                                >
                                    <Wand2 size={16} />
                                </button>

                                <div className="h-4 w-px bg-white/10 mx-1" />
                                
                                <button onClick={() => setShowMarkdownHelp(!showMarkdownHelp)} className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 rounded transition-colors" title="Markdown Help"><HelpCircle size={16}/></button>
                                <MarkdownHelp isOpen={showMarkdownHelp} onClose={() => setShowMarkdownHelp(false)} />
                            </div>
                        )}

                        {isPreviewMode ? (
                            <div className="prose prose-invert prose-p:text-gray-300 max-w-none"><ReactMarkdown children={activeNote.content} components={MarkdownComponents} /></div>
                        ) : (
                            <textarea ref={textareaRef} value={activeNote.content} onChange={(e) => handleUpdateNote(activeNote.id, 'content', e.target.value)} className="w-full h-[60vh] bg-transparent resize-none focus:outline-none text-sm leading-relaxed text-gray-300 font-mono" placeholder="Start writing... (Try using the toolbar above)" />
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
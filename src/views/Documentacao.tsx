import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Lead, Document, cn } from '../types';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Search, 
  User as UserIcon, 
  X, 
  File, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Documentacao: React.FC = () => {
  const { user } = useAuth();
  const { leads, documents, uploadDocument, deleteDocument } = useData();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setSearchTerm(lead.name);
    setIsDropdownOpen(false);
  };

  const leadDocuments = documents.filter(doc => doc.leadId === selectedLead?.id);
  const canUpload = leadDocuments.length < 15;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedLead) return;

    if (leadDocuments.length + files.length > 15) {
      alert('Limite de 15 documentos por cliente atingido.');
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadDocument(selectedLead.id, files[i]);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Documentação do Cliente</h2>
          <p className="text-slate-500 mt-1">Gerencie os documentos e arquivos jurídicos de cada cliente.</p>
        </div>
      </div>

      {/* Lead Selection Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <div className="max-w-2xl">
          <label className="block text-sm font-bold text-slate-700 mb-3">Selecione o Cliente</label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Buscar por nome do cliente..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLead(null);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isDropdownOpen && filteredLeads.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar"
                >
                  {filteredLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.email}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {selectedLead ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Upload size={20} className="text-primary" />
                Enviar Documentos
              </h3>
              
              <div 
                onClick={() => canUpload && !isUploading && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer",
                  canUpload && !isUploading 
                    ? "border-slate-200 hover:border-primary hover:bg-primary/5" 
                    : "border-slate-100 bg-slate-50 cursor-not-allowed opacity-60"
                )}
              >
                {isUploading ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                ) : (
                  <Upload className="w-10 h-10 text-slate-300 mb-4" />
                )}
                <p className="text-sm font-bold text-slate-700">
                  {isUploading ? 'Enviando arquivos...' : 'Clique para selecionar'}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  PDF, JPG, PNG (Máx. 10MB)
                </p>
                <p className="text-xs font-medium text-primary mt-4">
                  {leadDocuments.length} de 15 documentos
                </p>
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
              />

              {!canUpload && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                  <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Limite de 15 documentos atingido para este cliente. Remova algum para enviar novos.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
              <h4 className="font-bold text-primary mb-2">Dica Jurídica</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mantenha os documentos organizados por tipo (RG, CPF, Comprovante de Residência, etc.) para facilitar a análise dos consultores.
              </p>
            </div>
          </div>

          {/* Documents List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  Documentos de {selectedLead.name}
                </h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                  {leadDocuments.length} Arquivos
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                {leadDocuments.length > 0 ? (
                  leadDocuments.map((doc) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={doc.id}
                      className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <File size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm truncate max-w-[200px] md:max-w-sm">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {formatFileSize(doc.size)}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase">
                              Por: {doc.uploadedBy}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          title="Visualizar / Baixar"
                        >
                          <Download size={18} />
                        </a>
                        <button 
                          onClick={() => {
                            if (window.confirm('Deseja realmente excluir este documento?')) {
                              deleteDocument(doc.id);
                            }
                          }}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
                      <FileText size={40} />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">Nenhum documento enviado</h4>
                    <p className="text-sm text-slate-500 max-w-xs">
                      Ainda não há documentos cadastrados para este cliente. Utilize o painel lateral para enviar arquivos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
            <UserIcon size={40} />
          </div>
          <h4 className="font-bold text-slate-800 mb-2">Selecione um cliente</h4>
          <p className="text-sm text-slate-500 max-w-xs">
            Escolha um cliente na busca acima para gerenciar sua documentação jurídica.
          </p>
        </div>
      )}
    </div>
  );
};

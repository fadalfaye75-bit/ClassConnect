
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { FileSpreadsheet, Upload, Download, ExternalLink, Link as LinkIcon, AlertCircle, Info, Send, Trash2, Mail, Save, Check, FileCheck, CalendarClock, X, Eye, Globe } from 'lucide-react';
import { format, formatDistanceToNow, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Timetable: React.FC = () => {
  const { user, classes, updateClass, addNotification, shareResource } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [timetableUrl, setTimetableUrl] = useState('');
  const [fileName, setFileName] = useState('');
  
  // Modals
  const [shareConfirmation, setShareConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);

  const currentClass = classes.find(c => c.id === user?.classId);
  const canEdit = user?.role === Role.RESPONSIBLE || user?.role === Role.ADMIN;

  // Calcul des dates de la semaine
  const today = new Date();
  const startWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endWeek = endOfWeek(today, { weekStartsOn: 1 });

  const startEditing = () => {
    setTimetableUrl(currentClass?.timetableUrl || '');
    setFileName('');
    setIsEditing(true);
  };

  const handlePreUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timetableUrl) {
      addNotification("Veuillez fournir un lien ou un fichier.", "WARNING");
      return;
    }
    setSaveConfirmation(true);
  };

  const handleConfirmUpdate = () => {
    if (currentClass) {
      updateClass(currentClass.id, { 
        timetableUrl: timetableUrl,
        timetableLastUpdate: new Date().toISOString()
      });
      setIsEditing(false);
      setSaveConfirmation(false);
      addNotification("Emploi du temps mis à jour avec succès", "SUCCESS");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification("Le fichier est trop volumineux (Max 5Mo).", "ERROR");
        return;
      }

      // Lecture pour le stockage (Base64)
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          setTimetableUrl(result);
          setFileName(file.name);
          addNotification("Fichier prêt. Cliquez sur 'Sauvegarder' pour publier.", "SUCCESS");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelection = () => {
    setTimetableUrl('');
    setFileName('');
  };

  const handleConfirmShare = () => {
    if (currentClass?.timetableUrl) {
      shareResource('TIMETABLE', { url: currentClass.timetableUrl });
      setShareConfirmation(false);
    }
  };

  const handleConfirmDelete = () => {
    if (currentClass) {
      // On passe une chaîne vide pour signifier la suppression à la base de données
      updateClass(currentClass.id, { timetableUrl: '' });
      setDeleteConfirmation(false);
      addNotification("Emploi du temps supprimé", "INFO");
    }
  };

  if (!currentClass) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Aucune classe assignée</h2>
        <p className="text-slate-500">Vous devez être rattaché à une classe pour voir son emploi du temps.</p>
      </div>
    );
  }

  // Determine what to display: Current saved URL or Draft URL if editing
  const displayedUrl = isEditing ? timetableUrl : currentClass.timetableUrl;
  const isDataFile = displayedUrl?.startsWith('data:');
  const isPreview = isEditing && displayedUrl !== currentClass.timetableUrl;

  return (
    <div className="max-w-5xl mx-auto px-0 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
          <span className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 p-2 rounded-xl text-emerald-600">
            <FileSpreadsheet className="w-8 h-8" />
          </span>
          Emploi du temps
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg">
          Semaine du {format(startWeek, 'dd', { locale: fr })} au {format(endWeek, 'dd MMMM', { locale: fr })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Content (Download Card) */}
        <div className="md:col-span-2">
          <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border p-10 flex flex-col items-center justify-center text-center h-full min-h-[400px] relative overflow-hidden group transition-all ${isPreview ? 'border-amber-400 ring-4 ring-amber-400/10 shadow-amber-500/10' : 'border-emerald-100 dark:border-emerald-900/50 shadow-emerald-500/5'}`}>
             
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-50 dark:bg-teal-900/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>

             {/* Preview / Status Banner */}
             {isPreview ? (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-pulse shadow-sm z-20 border border-amber-200">
                    <Eye className="w-3.5 h-3.5" /> Prévisualisation - Non publié
                </div>
             ) : displayedUrl ? (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm z-20 border border-emerald-200 dark:border-emerald-800">
                    <Globe className="w-3.5 h-3.5" /> Publié & Visible par les élèves
                </div>
             ) : null}

             {displayedUrl ? (
                <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500 pt-8">
                   <div className="w-28 h-28 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center shadow-inner mb-6 group-hover:rotate-3 transition-transform duration-300">
                      <FileSpreadsheet className="w-14 h-14" />
                   </div>
                   
                   <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                       {isPreview ? (fileName || "Nouveau Document") : "Document Disponible"}
                   </h3>
                   <p className="text-slate-500 font-medium max-w-sm mb-8">
                      {isPreview 
                        ? "Ce document est prêt à être publié. Cliquez sur 'Sauvegarder' à droite pour le rendre visible." 
                        : `L'emploi du temps est actuellement en ligne. Mis à jour ${currentClass.timetableLastUpdate ? formatDistanceToNow(new Date(currentClass.timetableLastUpdate), { addSuffix: true, locale: fr }) : ''}.`
                      }
                   </p>

                   <a 
                      href={displayedUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      download={isDataFile ? "Emploi_Du_Temps.xlsx" : undefined}
                      className={`px-8 py-4 text-white rounded-2xl font-bold transition shadow-lg flex items-center gap-3 hover:-translate-y-1 ${isPreview ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'}`}
                      onClick={e => isPreview && e.preventDefault()}
                   >
                      <Download className="w-6 h-6" /> {isPreview ? 'Téléchargement (Après sauvegarde)' : 'Télécharger le fichier'}
                   </a>
                </div>
             ) : (
                <div className="relative z-10 flex flex-col items-center opacity-60">
                   <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4">
                      <CalendarClock className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Aucun document</h3>
                   <p className="text-slate-500">L'emploi du temps n'a pas encore été publié.</p>
                </div>
             )}
          </div>
        </div>

        {/* Sidebar / Admin Panel */}
        <div className="md:col-span-1 space-y-6">
           {/* Info Card */}
           <div className={`p-6 rounded-[2rem] border transition-colors ${currentClass.timetableUrl && !isEditing ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
              <h3 className={`font-bold mb-2 flex items-center gap-2 ${currentClass.timetableUrl && !isEditing ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                 <Info className="w-5 h-5"/> {currentClass.timetableUrl && !isEditing ? 'Statut : En ligne' : 'Information'}
              </h3>
              <p className={`text-sm leading-relaxed font-medium ${currentClass.timetableUrl && !isEditing ? 'text-emerald-700 dark:text-emerald-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                 {currentClass.timetableUrl && !isEditing 
                    ? `✅ Le document est actuellement accessible par tous les étudiants de la classe ${currentClass.name}.`
                    : `Le fichier téléchargé sera accessible à tous les étudiants de la classe ${currentClass.name}.`
                 }
              </p>
           </div>

           {canEdit && (
             <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                   <Upload className="w-5 h-5 text-emerald-500" /> Mettre à jour
                </h3>
                
                {!isEditing ? (
                   <>
                    <button 
                        onClick={startEditing}
                        className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition mb-3"
                    >
                        {currentClass.timetableUrl ? "Remplacer le fichier" : "Déposer le document"}
                    </button>
                    {currentClass.timetableUrl && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShareConfirmation(true)}
                                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 text-sm"
                            >
                                <Send className="w-4 h-4" /> Notifier
                            </button>
                            <button 
                                onClick={() => setDeleteConfirmation(true)}
                                className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition border border-red-100 dark:border-red-900"
                                title="Supprimer définitivement"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                   </>
                ) : (
                   <form onSubmit={handlePreUpdate} className="space-y-4 animate-in fade-in">
                      <div>
                         <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Lien Google Sheets / Public</label>
                         <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input 
                              type="url" 
                              value={timetableUrl.startsWith('data:') ? '' : timetableUrl}
                              onChange={e => setTimetableUrl(e.target.value)}
                              placeholder="https://docs.google.com/..."
                              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white font-medium"
                              autoFocus
                            />
                         </div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-bold">OU</span></div>
                      </div>

                      <div className="relative">
                          <label className={`w-full flex flex-col items-center px-4 py-4 bg-slate-50 dark:bg-slate-950 text-slate-500 rounded-xl border-2 border-dashed transition cursor-pointer ${fileName || timetableUrl.startsWith('data:') ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                              {fileName || (timetableUrl.startsWith('data:') && "Fichier existant") ? (
                                <FileCheck className="w-6 h-6 mb-1 text-emerald-500" />
                              ) : (
                                <Upload className="w-6 h-6 mb-1" />
                              )}
                              <span className="text-xs font-bold truncate max-w-full">
                                {fileName ? fileName : (timetableUrl.startsWith('data:') ? "Fichier prêt" : "Déposer Excel / PDF")}
                              </span>
                              <input type='file' className="hidden" accept=".xlsx,.xls,.pdf,.doc,.docx" onChange={handleFileUpload} />
                          </label>
                          
                          {/* Bouton pour retirer le fichier sélectionné */}
                          {(fileName || timetableUrl) && (
                            <button 
                                type="button" 
                                onClick={clearSelection}
                                className="absolute top-2 right-2 p-1 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hover:text-red-500 transition"
                                title="Retirer le fichier"
                            >
                                <X className="w-3 h-3" />
                            </button>
                          )}
                      </div>

                      <div className="flex gap-2 pt-2">
                         <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">Annuler</button>
                         <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition">Sauvegarder</button>
                      </div>
                   </form>
                )}
             </div>
           )}
        </div>
      </div>

      {/* --- CONFIRMATION MODALS --- */}
      {shareConfirmation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[170] flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Mail className="w-10 h-10" /></div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Partager par Email</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">Voulez-vous envoyer le lien de l'emploi du temps à toute la classe ?</p>
              <div className="flex gap-4">
                 <button onClick={() => setShareConfirmation(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">Annuler</button>
                 <button onClick={handleConfirmShare} className="flex-1 py-3.5 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">Envoyer</button>
              </div>
           </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[180] flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center border border-slate-100 dark:border-slate-800 transform transition-all scale-100">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Trash2 className="w-8 h-8" /></div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Supprimer le document ?</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Cela retirera l'accès à l'emploi du temps actuel pour tous les élèves.</p>
              <div className="flex gap-3">
                 <button onClick={() => setDeleteConfirmation(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">Annuler</button>
                 <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20">Supprimer</button>
              </div>
           </div>
        </div>
      )}

      {saveConfirmation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[180] flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center border border-slate-100 dark:border-slate-800 transform transition-all scale-100">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Save className="w-8 h-8" /></div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Confirmer la mise à jour ?</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Le nouvel emploi du temps sera immédiatement disponible au téléchargement pour tous les élèves.</p>
              <div className="flex gap-3">
                 <button onClick={() => setSaveConfirmation(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">Annuler</button>
                 <button onClick={handleConfirmUpdate} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Confirmer
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

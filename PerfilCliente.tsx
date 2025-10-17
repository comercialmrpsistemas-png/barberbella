import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Save, Key, Eye, EyeOff, UploadCloud, X } from 'lucide-react';
import { formatPhone, formatBirthDate, toYYYYMMDD, toDDMMYYYY, formatCpf } from '../../utils/formatters';
import { useModal } from '../../contexts/ModalContext';

const PerfilCliente: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showAlert } = useModal();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: toDDMMYYYY(user?.birthDate),
    cpf: user?.cpf ? formatCpf(user.cpf) : '',
  });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];

    if (file.size > maxSize) {
      showAlert({ title: 'Arquivo Grande', message: 'O tamanho máximo é 2MB.', type: 'error' });
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      showAlert({ title: 'Formato Inválido', message: 'Apenas PNG, JPG e WEBP são aceitos.', type: 'error' });
      return;
    }

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };
  
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const birthDateYYYYMMDD = toYYYYMMDD(formData.birthDate);
    const cleanCpf = formData.cpf.replace(/\D/g, '');
    setTimeout(() => {
      updateUser({ ...formData, birthDate: birthDateYYYYMMDD, cpf: cleanCpf, avatarUrl: avatarPreview || undefined });
      showAlert({ title: 'Sucesso!', message: 'Informações atualizadas com sucesso!', type: 'success' });
      setLoading(false);
    }, 1000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new.length < 6) {
      showAlert({ title: 'Erro', message: 'A nova senha deve ter no mínimo 6 caracteres.', type: 'error' });
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      showAlert({ title: 'Erro', message: 'As novas senhas não coincidem.', type: 'error' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      showAlert({ title: 'Sucesso!', message: 'Senha alterada com sucesso!', type: 'success' });
      setPasswordData({ current: '', new: '', confirm: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <User className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-white">Meu Perfil</h1>
          <p className="text-light-500 dark:text-dark-400">Gerencie suas informações pessoais</p>
        </div>
      </div>
      
      <form onSubmit={handleInfoSubmit}>
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-light-900 dark:text-white">Informações Pessoais</h2>
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome</label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full input-style" />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Email</label>
                <input type="email" value={formData.email} className="w-full input-style" disabled />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Telefone</label>
                  <input type="tel" value={formatPhone(formData.phone)} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full input-style" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Data de Nascimento</label>
                  <input type="text" value={formData.birthDate} onChange={e => setFormData(p => ({ ...p, birthDate: formatBirthDate(e.target.value) }))} className="w-full input-style" placeholder="dd/mm/aaaa" maxLength={10} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">CPF</label>
                <input 
                  type="text" 
                  value={formData.cpf} 
                  onChange={e => setFormData(p => ({ ...p, cpf: formatCpf(e.target.value) }))} 
                  className="w-full input-style" 
                  disabled={!!user?.cpf}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                 {!user?.cpf && <p className="text-xs text-light-500 dark:text-dark-500 mt-1">O CPF, uma vez salvo, não poderá ser alterado.</p>}
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-light-900 dark:text-white">Foto de Perfil</h2>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500' : 'border-light-300 dark:border-dark-600'}`}
              >
                <input ref={fileInputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                {avatarPreview ? (
                  <div className="relative group w-32 h-32 mx-auto">
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    <button type="button" onClick={handleRemoveAvatar} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32">
                    <UploadCloud className="w-10 h-10 text-light-400 dark:text-dark-500 mb-2" />
                    <p className="text-sm text-light-700 dark:text-dark-300">Arraste ou clique para enviar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50">
                <Save className="w-5 h-5" />
                <span>Salvar Alterações</span>
            </button>
        </div>
      </form>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700">
        <h2 className="text-lg font-semibold text-light-900 dark:text-white mb-4">Alterar Senha</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Senha Atual</label>
                  <input type="password" value={passwordData.current} onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))} className="w-full input-style" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nova Senha</label>
                  <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={passwordData.new} onChange={e => setPasswordData(p => ({ ...p, new: e.target.value }))} className="w-full input-style pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-500 dark:text-dark-400"><Eye className="w-5 h-5" /></button>
                  </div>
                  <p className="text-xs text-light-500 dark:text-dark-400 mt-1">A senha deve ter no mínimo 6 caracteres.</p>
              </div>
              <div>
                  <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Confirmar Nova Senha</label>
                  <input type="password" value={passwordData.confirm} onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))} className="w-full input-style" />
              </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50">
              <Key className="w-4 h-4" />
              <span>Alterar Senha</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PerfilCliente;

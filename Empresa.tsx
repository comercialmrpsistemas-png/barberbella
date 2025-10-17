import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building, Save, Clock, Percent, Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatPhone } from '../../utils/formatters';
import { useModal } from '../../contexts/ModalContext';

interface BusinessHour {
  day: string;
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
  active: boolean;
}

const Empresa: React.FC = () => {
  const { company, updateCompany } = useAuth();
  const { showAlert } = useModal();
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  
  const [formData, setFormData] = useState({
    document: '',
    name: '',
    phone: '',
    address: '',
    discount_limit: 20,
    markup_limit: 50
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([
    { day: 'Segunda-feira', start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00', active: true },
    { day: 'Terça-feira', start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00', active: true },
    { day: 'Quarta-feira', start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00', active: true },
    { day: 'Quinta-feira', start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00', active: true },
    { day: 'Sexta-feira', start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00', active: true },
    { day: 'Sábado', start_time: '08:00', end_time: '16:00', break_start: '', break_end: '', active: true },
    { day: 'Domingo', start_time: '', end_time: '', break_start: '', break_end: '', active: false }
  ]);

  useEffect(() => {
    if (company) {
      const docType = company.document.replace(/\D/g, '').length > 11 ? 'cnpj' : 'cpf';
      setDocumentType(docType);
      setFormData({
        document: formatDocument(company.document, docType),
        name: company.name,
        phone: formatPhone(company.phone),
        address: company.address,
        discount_limit: company.discount_limit,
        markup_limit: company.markup_limit
      });
      setLogoPreview(company.logo_url || null);
    }
  }, [company]);

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

    if (file.size > maxSize) {
      showAlert({ title: 'Arquivo Grande', message: 'O arquivo é muito grande. O tamanho máximo é 2MB.', type: 'error' });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      showAlert({ title: 'Formato Inválido', message: 'Formato de arquivo inválido. Apenas PNG, JPG, WEBP e SVG são aceitos.', type: 'error' });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatDocument = (value: string, type: 'cpf' | 'cnpj') => {
    const numbers = value.replace(/\D/g, '');
    if (type === 'cpf') {
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      document: formatDocument(e.target.value, documentType)
    }));
  };
  
  const handleDocumentTypeChange = (type: 'cpf' | 'cnpj') => {
    setDocumentType(type);
    setFormData(prev => ({ ...prev, document: '' }));
  };

  const handleBusinessHourChange = (index: number, field: keyof BusinessHour, value: string | boolean) => {
    setBusinessHours(prev => prev.map((hour, i) => 
      i === index ? { ...hour, [field]: value } : hour
    ));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newLogoUrl = logoPreview;

      const updatedCompanyData = {
        ...company!,
        ...formData,
        logo_url: newLogoUrl || undefined,
        business_hours: businessHours,
      };

      updateCompany(updatedCompanyData);

      await new Promise(resolve => setTimeout(resolve, 1000));
      showAlert({ title: 'Sucesso', message: 'Configurações da empresa salvas com sucesso!', type: 'success' });
    } catch (error) {
      showAlert({ title: 'Erro', message: 'Ocorreu um erro ao salvar as configurações.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Building className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-800 dark:text-white">Configurações da Empresa</h1>
          <p className="text-light-500 dark:text-dark-400">Configure as informações básicas da sua empresa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-200 dark:border-dark-700"
        >
          <h2 className="text-lg font-semibold text-light-800 dark:text-white mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                Tipo de Documento *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="documentType"
                    value="cpf"
                    checked={documentType === 'cpf'}
                    onChange={() => handleDocumentTypeChange('cpf')}
                    className="form-radio bg-light-200 dark:bg-dark-700 border-light-300 dark:border-dark-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-light-800 dark:text-white">CPF</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="documentType"
                    value="cnpj"
                    checked={documentType === 'cnpj'}
                    onChange={() => handleDocumentTypeChange('cnpj')}
                    className="form-radio bg-light-200 dark:bg-dark-700 border-light-300 dark:border-dark-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-light-800 dark:text-white">CNPJ</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                {documentType === 'cpf' ? 'CPF' : 'CNPJ'} *
              </label>
              <input
                type="text"
                value={formData.document}
                onChange={handleDocumentChange}
                className="w-full input-style"
                placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                maxLength={documentType === 'cpf' ? 14 : 18}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                Nome da Empresa *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full input-style"
                placeholder="Nome da sua empresa"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full input-style"
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full input-style"
                placeholder="Endereço completo"
              />
            </div>
          </div>
        </motion.div>

        {/* Identidade Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-200 dark:border-dark-700"
        >
          <h2 className="text-lg font-semibold text-light-800 dark:text-white mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Identidade Visual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                Logo da Empresa
              </label>
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20' : 'border-light-300 dark:border-dark-600 hover:border-blue-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                />
                <UploadCloud className="w-10 h-10 mx-auto text-light-400 dark:text-dark-500 mb-2" />
                <p className="text-sm text-light-700 dark:text-dark-300">
                  Arraste e solte o arquivo aqui, ou <span className="text-blue-500 font-semibold">clique para selecionar</span>.
                </p>
                <p className="text-xs text-light-500 dark:text-dark-400 mt-2">
                  Tamanho máximo: 2MB. Formatos aceitos: PNG, JPG, WEBP, SVG.
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center h-28 bg-light-200 dark:bg-dark-700 rounded-lg p-2">
              {logoPreview ? (
                <div className="relative group h-full w-full flex items-center justify-center">
                  <img src={logoPreview} alt="Pré-visualização do Logo" className="max-h-full max-w-full object-contain" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover imagem"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className="text-light-500 dark:text-dark-500 text-sm">Pré-visualização</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Configurações de Vendas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-200 dark:border-dark-700"
        >
          <h2 className="text-lg font-semibold text-light-800 dark:text-white mb-4 flex items-center">
            <Percent className="w-5 h-5 mr-2" />
            Configurações de Vendas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                Limite de Desconto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_limit: Number(e.target.value) }))}
                className="w-full input-style"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                Limite de Acréscimo (%)
              </label>
              <input
                type="number"
                min="0"
                value={formData.markup_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, markup_limit: Number(e.target.value) }))}
                className="w-full input-style"
              />
            </div>
          </div>
        </motion.div>

        {/* Horários de Funcionamento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-200 dark:border-dark-700"
        >
          <h2 className="text-lg font-semibold text-light-800 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Horários de Funcionamento
          </h2>
          
          <div className="space-y-4">
            {businessHours.map((hour, index) => (
              <div key={hour.day} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                <div className="col-span-12 sm:col-span-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hour.active}
                      onChange={(e) => handleBusinessHourChange(index, 'active', e.target.checked)}
                      className="rounded border-light-300 dark:border-dark-600 bg-light-200 dark:bg-dark-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-light-700 dark:text-dark-300">{hour.day}</span>
                  </label>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="time"
                    value={hour.start_time}
                    onChange={(e) => handleBusinessHourChange(index, 'start_time', e.target.value)}
                    disabled={!hour.active}
                    className="w-full input-style py-2 text-sm disabled:opacity-50"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="time"
                    value={hour.end_time}
                    onChange={(e) => handleBusinessHourChange(index, 'end_time', e.target.value)}
                    disabled={!hour.active}
                    className="w-full input-style py-2 text-sm disabled:opacity-50"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="time"
                    value={hour.break_start || ''}
                    onChange={(e) => handleBusinessHourChange(index, 'break_start', e.target.value)}
                    disabled={!hour.active}
                    placeholder="Início intervalo"
                    className="w-full input-style py-2 text-sm disabled:opacity-50"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="time"
                    value={hour.break_end || ''}
                    onChange={(e) => handleBusinessHourChange(index, 'break_end', e.target.value)}
                    disabled={!hour.active}
                    placeholder="Fim intervalo"
                    className="w-full input-style py-2 text-sm disabled:opacity-50"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-light-500 dark:text-dark-400">
            <p>Configure os horários de funcionamento da empresa. Os intervalos são opcionais.</p>
          </div>
        </motion.div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Empresa;

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit, Trash2, X, Save, Key, Eye, EyeOff } from 'lucide-react';
import { menuItems } from '../../components/Layout/menuConfig';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useModal } from '../../contexts/ModalContext';

type UserRole = 'tecnico' | 'administrador' | 'funcionario';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  permissions?: string[];
}

const mockUsers: User[] = [
  { id: '1', name: 'Master', email: 'master@sistema.com', role: 'tecnico', active: true },
  { id: '2', name: 'Admin Barbearia', email: 'admin@barbearia.com', role: 'administrador', active: true },
  { id: '3', name: 'Barbeiro Zé', email: 'ze@barbearia.com', role: 'funcionario', active: true, permissions: ['dashboard', 'agendamentos'] },
  { id: '4', name: 'Manicure Ana', email: 'ana@barbearia.com', role: 'funcionario', active: false, permissions: ['dashboard', 'agendamentos', 'vendas'] },
];

const roleColors: Record<UserRole, string> = {
  tecnico: 'bg-red-100 dark:bg-red-600/20 text-red-800 dark:text-red-400',
  administrador: 'bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-400',
  funcionario: 'bg-green-100 dark:bg-green-600/20 text-green-800 dark:text-green-400',
};

const defaultFormState = {
  name: '',
  email: '',
  role: 'funcionario' as UserRole,
  active: true,
  permissions: [],
  password: '',
  confirmPassword: ''
};

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User> & { password?: string; confirmPassword?: string }>(defaultFormState);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { getLimit } = useSubscription();
  const { showConfirm, showAlert } = useModal();

  const adminCount = useMemo(() => users.filter(u => u.role === 'administrador').length, [users]);
  const employeeCount = useMemo(() => users.filter(u => u.role === 'funcionario').length, [users]);

  const adminLimit = getLimit('admin_users');
  const employeeLimit = getLimit('employee_users');

  const canAddAdmin = adminLimit === null || adminCount < adminLimit;
  const canAddEmployee = employeeLimit === null || employeeCount < employeeLimit;
  const isUserLimitReached = !canAddAdmin && !canAddEmployee;

  const openModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsChangingPassword(false);
    setPasswordError('');
    setShowPassword(false);
    if (user) {
      setFormData({ ...user, password: '', confirmPassword: '' });
      setPermissions(user.permissions || []);
    } else {
      let defaultRole: UserRole = 'funcionario';
      if (!canAddEmployee && canAddAdmin) {
        defaultRole = 'administrador';
      }
      setFormData({...defaultFormState, role: defaultRole});
      setPermissions([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData(defaultFormState);
    setPermissions([]);
  };

  const handlePermissionChange = (permissionId: string) => {
    setPermissions(prev => {
        if (prev.includes(permissionId)) {
            return prev.filter(p => p !== permissionId);
        } else {
            return [...prev, permissionId];
        }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!editingUser || isChangingPassword) {
      if (!formData.password || formData.password.length < 6) {
        setPasswordError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('As senhas não coincidem.');
        return;
      }
    }

    const { password, confirmPassword, ...userData } = formData;
    const finalData = { ...userData, permissions: formData.role === 'funcionario' ? permissions : undefined };
    
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...finalData } as User : u));
    } else {
      setUsers([...users, { id: Date.now().toString(), ...finalData } as User]);
    }
    closeModal();
    showAlert({ title: 'Salvo!', message: 'Usuário salvo com sucesso.', type: 'success' });
  };
  
  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId && user.role !== 'tecnico' ? { ...user, active: !user.active } : user
    ));
  };
  
  const handleDeleteUser = (userId: string) => {
    showConfirm({
      title: 'Excluir Usuário',
      message: 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      type: 'warning',
      onConfirm: () => {
        setUsers(users.filter(user => user.id !== userId && user.role !== 'tecnico'));
        showAlert({ title: 'Excluído', message: 'Usuário excluído com sucesso.', type: 'success' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Gerenciamento de Usuários</h1>
            <p className="text-light-500 dark:text-dark-400">Adicione, edite e gerencie os usuários do sistema</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
            <button
              onClick={() => openModal()}
              disabled={isUserLimitReached}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>{isUserLimitReached ? 'Limite Atingido' : 'Novo Usuário'}</span>
            </button>
            <div className="text-xs text-light-500 dark:text-dark-400 mt-1 space-x-2">
                {adminLimit !== null && <span>Admins: {adminCount}/{adminLimit}</span>}
                {employeeLimit !== null && <span>Funcionários: {employeeCount}/{employeeLimit}</span>}
            </div>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-300 dark:border-dark-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-light-200 dark:bg-dark-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Nome</th>
                <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Email</th>
                <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Perfil</th>
                <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Status</th>
                <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={`border-b border-light-300 dark:border-dark-700 last:border-b-0 transition-opacity ${!user.active ? 'opacity-50' : ''}`}>
                  <td className="p-4 text-light-900 dark:text-dark-200">{user.name}</td>
                  <td className="p-4 text-light-500 dark:text-dark-400">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <label className="relative inline-flex items-center cursor-pointer" title={user.active ? 'Ativo' : 'Inativo'}>
                      <input 
                        type="checkbox" 
                        checked={user.active}
                        onChange={() => handleToggleStatus(user.id)}
                        disabled={user.role === 'tecnico'}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-light-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                    </label>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button onClick={() => openModal(user)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-blue-500 dark:hover:text-blue-400" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        disabled={user.role === 'tecnico'}
                        className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-300 dark:border-dark-600 w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-light-300 dark:border-dark-700">
                <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Email</label>
                    <input type="email" value={formData.email || ''} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="w-full input-style" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Perfil</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData(p => ({...p, role: e.target.value as UserRole}))}
                    className="w-full input-style"
                    disabled={editingUser?.role === 'tecnico'}
                  >
                    <option value="funcionario" disabled={!editingUser && !canAddEmployee}>
                      Funcionário
                    </option>
                    <option value="administrador" disabled={!editingUser && !canAddAdmin}>
                      Administrador
                    </option>
                    {editingUser?.role === 'tecnico' && <option value="tecnico">Técnico</option>}
                  </select>
                  {!editingUser && !canAddAdmin && formData.role === 'administrador' && <p className="text-xs text-red-500 mt-1">Limite de administradores atingido.</p>}
                  {!editingUser && !canAddEmployee && formData.role === 'funcionario' && <p className="text-xs text-red-500 mt-1">Limite de funcionários atingido.</p>}
                </div>
                
                {passwordError && (
                  <div className="text-red-500 dark:text-red-400 text-sm">{passwordError}</div>
                )}

                {editingUser && !isChangingPassword && (
                  <button type="button" onClick={() => setIsChangingPassword(true)} className="flex items-center space-x-2 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                    <Key className="w-4 h-4" />
                    <span>Alterar Senha</span>
                  </button>
                )}

                {(!editingUser || isChangingPassword) && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Senha</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} value={formData.password || ''} onChange={e => setFormData(p => ({...p, password: e.target.value}))} className="w-full input-style pr-10" minLength={6} required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-500 dark:text-dark-400 hover:text-light-800 dark:hover:text-white">
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                         <p className="text-xs text-light-500 dark:text-dark-400 mt-1">A senha deve ter no mínimo 6 caracteres.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Confirmar Senha</label>
                        <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword || ''} onChange={e => setFormData(p => ({...p, confirmPassword: e.target.value}))} className="w-full input-style" required />
                      </div>
                    </div>
                    {editingUser && isChangingPassword && (
                      <button type="button" onClick={() => setIsChangingPassword(false)} className="text-sm text-light-500 dark:text-dark-400 hover:text-light-800 dark:hover:text-white">
                        Cancelar alteração de senha
                      </button>
                    )}
                  </div>
                )}
                
                {formData.role === 'funcionario' && (
                  <div>
                    <h3 className="text-md font-semibold text-light-900 dark:text-dark-200 mb-3">Permissões de Acesso</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-light-200 dark:bg-dark-700 p-4 rounded-lg">
                      {menuItems.filter(item => item.id !== 'configuracoes').map(item => (
                        <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={permissions.includes(item.id)}
                            onChange={() => handlePermissionChange(item.id)}
                            className="rounded border-light-300 dark:border-dark-600 bg-light-50 dark:bg-dark-900 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-light-700 dark:text-dark-300">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    <span>Salvar</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Usuarios;

import React, { useState, useMemo } from 'react';
import { Search, Package, Scissors, Box, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Service, Product, Combo, MonthlyPlan } from '../../types';
import { formatCurrency } from '../../utils/formatters';

type Item = Service | Product | Combo | MonthlyPlan;
type ItemType = 'service' | 'product' | 'combo' | 'package';
type TabType = 'service' | 'product' | 'combo-service' | 'combo-product' | 'package';

interface ItemListProps {
  onAddItem: (item: Item, type: ItemType) => void;
  isWalkIn: boolean;
}

const ItemList: React.FC<ItemListProps> = ({ onAddItem, isWalkIn }) => {
  const { servicos, produtos, combos, planos } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('service');
  const [search, setSearch] = useState('');

  const items = useMemo(() => {
    let list: Item[] = [];
    if (activeTab === 'service') list = servicos;
    else if (activeTab === 'product') list = produtos;
    else if (activeTab === 'combo-service') list = combos.filter(c => c.type === 'service');
    else if (activeTab === 'combo-product') list = combos.filter(c => c.type === 'product');
    else if (activeTab === 'package') list = planos;

    if (!search) return list;
    return list.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [activeTab, search, servicos, produtos, combos, planos]);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'service', label: 'Serviços', icon: Scissors },
    { id: 'product', label: 'Produtos', icon: Package },
    { id: 'combo-service', label: 'Combos Serv.', icon: Box },
    { id: 'combo-product', label: 'Combos Prod.', icon: Box },
    { id: 'package', label: 'Pacotes', icon: Award },
  ];
  
  const handleAddItem = (item: Item, tab: TabType) => {
    let itemType: ItemType;
    switch(tab) {
        case 'service':
        case 'product':
        case 'package':
            itemType = tab;
            break;
        case 'combo-service':
        case 'combo-product':
            itemType = 'combo';
            break;
        default:
            // This should not happen
            return;
    }
    onAddItem(item, itemType);
  };

  return (
    <div className="bg-light-100 dark:bg-dark-800 rounded-lg border border-light-200 dark:border-dark-700 flex flex-col h-full">
      <div className="p-4 border-b border-light-200 dark:border-dark-700">
        <div className="flex items-center gap-1 bg-light-200 dark:bg-dark-700 p-1 rounded-lg mb-4">
          {tabs.map(tab => {
            const isDisabled = tab.id === 'package' && isWalkIn;
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                title={isDisabled ? 'Selecione um cliente para vender pacotes' : ''}
                className={`w-full flex items-center justify-center gap-2 py-2 px-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-light-700 dark:text-dark-300 hover:bg-light-100 dark:hover:bg-dark-800'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-400 dark:text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Buscar em ${tabs.find(t => t.id === activeTab)?.label}...`}
            className="w-full input-style pl-10"
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => handleAddItem(item, activeTab)}
              className="bg-light-50 dark:bg-dark-900/50 p-3 rounded-lg border border-light-200 dark:border-dark-700 text-left hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <p className="font-semibold text-sm text-light-900 dark:text-white truncate">{item.name}</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-bold">{formatCurrency(item.price)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemList;

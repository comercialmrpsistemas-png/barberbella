import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, MessageCircle, Bot, User, Send, Plus, Trash2, Edit, GripVertical, BrainCircuit, Info } from 'lucide-react';

interface ChatOption {
  id: string;
  text: string;
}

interface FlowStep {
  id: string;
  type: 'bot-message' | 'bot-options';
  content: string;
  options?: ChatOption[];
}

const initialFlow: FlowStep[] = [
  { id: 'step1', type: 'bot-message', content: 'Olá! Bem-vindo ao sistema de agendamento da Barber e Bela.' },
  { id: 'step2', type: 'bot-message', content: 'Para começar, preciso verificar seu cadastro. Você já é nosso cliente?' },
  { id: 'step3', type: 'bot-options', content: 'Escolha uma opção:', options: [{ id: 'opt1', text: 'Sim, já sou cliente' }, { id: 'opt2', text: 'Não, quero me cadastrar' }] },
];

const Whatsapp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [zapiConfig, setZapiConfig] = useState({ enabled: true, apiKey: 'YOUR_API_KEY', instanceId: 'YOUR_INSTANCE_ID' });
  const [sleekflowConfig, setSleekflowConfig] = useState({ enabled: false, apiKey: 'YOUR_API_KEY' });
  const [chatGptConfig, setChatGptConfig] = useState({ enabled: false, apiKey: '' });
  
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>(initialFlow);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFlowChange = (index: number, field: keyof FlowStep, value: any) => {
    const newFlow = [...flowSteps];
    (newFlow[index] as any)[field] = value;
    setFlowSteps(newFlow);
  };
  
  const addStep = (index: number) => {
    const newStep: FlowStep = { id: `step${Date.now()}`, type: 'bot-message', content: 'Nova mensagem do bot' };
    const newFlow = [...flowSteps];
    newFlow.splice(index + 1, 0, newStep);
    setFlowSteps(newFlow);
  };
  
  const removeStep = (index: number) => {
    const newFlow = flowSteps.filter((_, i) => i !== index);
    setFlowSteps(newFlow);
  };

  const getSimulatedBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('agendar') || lowerInput.includes('marcar') || lowerInput.includes('horário')) {
      return 'Claro! Para qual dia e serviço você gostaria de agendar?';
    }
    if (lowerInput.includes('serviços') || lowerInput.includes('preços')) {
      return 'Nossos principais serviços são: Corte (R$40), Barba (R$30) e Manicure (R$25). Qual você prefere?';
    }
    if (lowerInput.includes('oi') || lowerInput.includes('olá') || lowerInput.includes('bom dia')) {
      return 'Olá! Sou o assistente virtual da Barber e Bela. Como posso te ajudar hoje?';
    }
    if (lowerInput.includes('cancelar')) {
      return 'Entendido. Para cancelar, por favor, me informe o dia e o horário do seu agendamento.';
    }
    return 'Desculpe, não entendi. Poderia reformular sua pergunta? Você pode pedir para agendar, cancelar ou perguntar sobre nossos serviços.';
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isBotTyping) return;

    const newUserMessage = { from: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      const botResponse = getSimulatedBotResponse(currentInput);
      const newBotMessage = { from: 'bot', text: botResponse };
      setMessages(prev => [...prev, newBotMessage]);
      setIsBotTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const startSimulation = () => {
    setMessages([{ from: 'bot', text: 'Olá! Sou o assistente virtual da Barber e Bela. Como posso ajudar?' }]);
  };
  
  useEffect(() => {
    if (chatGptConfig.enabled) {
      startSimulation();
    } else {
      setMessages([]);
    }
  }, [chatGptConfig.enabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Configurações do WhatsApp Bot salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const FlowEditor = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600"
    >
      <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 mb-4 flex items-center"><Edit className="w-5 h-5 mr-2" />Editor de Fluxo Fixo</h2>
      <div className="space-y-3">
        {flowSteps.map((step, index) => (
          <div key={step.id} className="bg-light-200 dark:bg-dark-700 p-3 rounded-lg border border-light-300 dark:border-dark-600">
            <div className="flex items-start space-x-2">
              <GripVertical className="w-5 h-5 text-light-500 dark:text-dark-500 mt-2 cursor-grab" />
              <div className="flex-1">
                <select value={step.type} onChange={(e) => handleFlowChange(index, 'type', e.target.value)} className="text-xs bg-light-300 dark:bg-dark-600 rounded px-2 py-1 mb-2 text-light-800 dark:text-dark-200">
                  <option value="bot-message">Mensagem do Bot</option>
                  <option value="bot-options">Opções para Cliente</option>
                </select>
                <textarea value={step.content} onChange={(e) => handleFlowChange(index, 'content', e.target.value)} className="w-full bg-light-50 dark:bg-dark-800 p-2 rounded text-sm input-style" rows={2} />
                {step.type === 'bot-options' && (
                  <div className="mt-2 space-y-2">
                    {step.options?.map((opt, optIndex) => (
                      <div key={opt.id} className="flex items-center space-x-2">
                        <input type="text" value={opt.text} onChange={(e) => { const newOptions = [...(step.options || [])]; newOptions[optIndex].text = e.target.value; handleFlowChange(index, 'options', newOptions); }} className="flex-1 bg-light-50 dark:bg-dark-600 p-2 rounded text-sm input-style" placeholder={`Opção ${optIndex + 1}`} />
                        <button onClick={() => { const newOptions = step.options?.filter(o => o.id !== opt.id); handleFlowChange(index, 'options', newOptions); }} className="p-1 text-light-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => { const newOptions = [...(step.options || []), {id: `opt${Date.now()}`, text: 'Nova Opção'}]; handleFlowChange(index, 'options', newOptions); }} className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center space-x-1"><Plus className="w-3 h-3" /><span>Adicionar Opção</span></button>
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <button onClick={() => addStep(index)} className="p-1 text-light-500 dark:text-dark-400 hover:text-green-500 dark:hover:text-green-400"><Plus className="w-4 h-4" /></button>
                <button onClick={() => removeStep(index)} className="p-1 text-light-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <MessageCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">WhatsApp Bot</h1>
          <p className="text-light-500 dark:text-dark-400">Configure a integração e o fluxo de agendamento do seu bot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          {!chatGptConfig.enabled ? (
            <FlowEditor />
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600">
              <div className="flex items-start space-x-3">
                <Info className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200">Modo Inteligente Ativado</h2>
                  <p className="text-sm text-light-500 dark:text-dark-400 mt-1">O fluxo de conversa agora é controlado pela inteligência artificial do ChatGPT. A simulação ao lado reflete uma conversa dinâmica.</p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 flex items-center"><BrainCircuit className="w-5 h-5 mr-2 text-purple-500"/>Integração ChatGPT</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={chatGptConfig.enabled} onChange={(e) => setChatGptConfig(p => ({...p, enabled: e.target.checked}))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-light-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <div className={`space-y-4 transition-opacity ${chatGptConfig.enabled ? 'opacity-100' : 'opacity-50'}`}>
                <input type="password" value={chatGptConfig.apiKey} onChange={(e) => setChatGptConfig(p => ({...p, apiKey: e.target.value}))} className="w-full input-style" placeholder="Sua chave de API da OpenAI" disabled={!chatGptConfig.enabled}/>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200">Configuração Z-API</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={zapiConfig.enabled} onChange={(e) => setZapiConfig(p => ({...p, enabled: e.target.checked}))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-light-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className={`space-y-4 transition-opacity ${zapiConfig.enabled ? 'opacity-100' : 'opacity-50'}`}>
                <input type="text" value={zapiConfig.apiKey} onChange={(e) => setZapiConfig(p => ({...p, apiKey: e.target.value}))} className="w-full input-style" placeholder="Sua chave de API do Z-API" disabled={!zapiConfig.enabled}/>
                <input type="text" value={zapiConfig.instanceId} onChange={(e) => setZapiConfig(p => ({...p, instanceId: e.target.value}))} className="w-full input-style" placeholder="ID da sua instância no Z-API" disabled={!zapiConfig.enabled}/>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200">Configuração SleekFlow</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={sleekflowConfig.enabled} onChange={(e) => setSleekflowConfig(p => ({...p, enabled: e.target.checked}))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-light-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className={`space-y-4 transition-opacity ${sleekflowConfig.enabled ? 'opacity-100' : 'opacity-50'}`}>
                <input type="text" value={sleekflowConfig.apiKey} onChange={(e) => setSleekflowConfig(p => ({...p, apiKey: e.target.value}))} className="w-full input-style" placeholder="Sua chave de API do SleekFlow" disabled={!sleekflowConfig.enabled}/>
              </div>
            </motion.div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                <Save className="w-5 h-5" />
                <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
              </button>
            </div>
          </form>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 flex flex-col">
          <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 mb-4">Simulação do Bot</h2>
          <div ref={chatContainerRef} className="bg-light-50 dark:bg-dark-900/50 rounded-lg p-4 flex-1 h-96 overflow-y-auto space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                  {msg.from === 'bot' && <Bot className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />}
                  <div className={`max-w-xs rounded-lg px-4 py-2 ${msg.from === 'bot' ? 'bg-light-200 dark:bg-dark-700 text-light-800 dark:text-dark-300' : 'bg-blue-600 text-white'}`}>
                    {msg.text}
                  </div>
                  {msg.from === 'user' && <User className="w-6 h-6 text-blue-500 dark:text-blue-300 flex-shrink-0" />}
                </motion.div>
              ))}
              {isBotTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                  <Bot className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <div className="max-w-xs rounded-lg px-4 py-2 bg-light-200 dark:bg-dark-700 text-light-800 dark:text-dark-300 flex items-center space-x-1">
                    <span className="w-2 h-2 bg-light-400 dark:bg-dark-400 rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-light-400 dark:bg-dark-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-light-400 dark:bg-dark-400 rounded-full animate-bounce delay-300"></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-4 border-t border-light-300 dark:border-dark-700 pt-4">
            {chatGptConfig.enabled ? (
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Digite sua mensagem..." className="w-full input-style" disabled={isBotTyping} />
                <button type="submit" disabled={isBotTyping || !userInput.trim()} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            ) : (
                <div className="text-center text-sm text-light-500 dark:text-dark-400">Ative a integração com o ChatGPT para iniciar uma conversa dinâmica.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Whatsapp;

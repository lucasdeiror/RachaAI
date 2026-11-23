import React, { useState, useEffect } from 'react';
import { CriarMesaForm, CriarMesaData } from './components/CriarMesaForm';
import { ItemComandaInput } from './components/CalculadoraComanda';
import { ItemComanda } from './components/SelecaoConsumo';
import { ParticipanteRadar } from './components/RadarQuitacao';
import { CompartilharMesa } from './components/CompartilharMesa';
import { PainelHost } from './components/PainelHost';
import { PainelConvidado } from './components/PainelConvidado';
import { Share2, Users, Crown } from 'lucide-react';

export const App: React.FC = () => {
  const [mesa, setMesa] = useState<any>(null);
  const [itens, setItens] = useState<ItemComanda[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteRadar[]>([]);
  const [mostrarModalCompartilhar, setMostrarModalCompartilhar] = useState(false);
  const [visaoAtual, setVisaoAtual] = useState<'HOST' | 'CONVIDADO'>('HOST');

  // Verifica se há parâmetro na URL para entrar direto como Convidado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mesaParam = params.get('mesa');
      const papelParam = params.get('papel');
      const hostParam = params.get('host');
      const pixParam = params.get('pix');
      const taxaParam = params.get('taxa');
      const itensParam = params.get('itens');

      if (mesaParam && !mesa) {
        const mesaCarregada = {
          id: 1,
          codigoHash: mesaParam,
          chavePixHost: pixParam || 'anfitriao@pix.me',
          nomeHost: hostParam || 'Lucas',
          taxaServico: taxaParam ? Number(taxaParam) : 10,
          status: 'ABERTA',
        };
        setMesa(mesaCarregada);
        if (itensParam) {
          try {
            const parsedItens = JSON.parse(itensParam);
            if (Array.isArray(parsedItens) && parsedItens.length > 0) {
              setItens(parsedItens);
            }
          } catch (e) {
            console.error('Erro ao ler itens compartilhados', e);
          }
        }
        setVisaoAtual('CONVIDADO');
      } else if (papelParam === 'convidado') {
        setVisaoAtual('CONVIDADO');
      }
    }
  }, []);

  const handleCriarMesa = (data: CriarMesaData) => {
    const hash = 'ROL-' + Math.floor(1000 + Math.random() * 9000);
    const novaMesa = {
      id: 1,
      codigoHash: hash,
      chavePixHost: data.chavePixHost,
      nomeHost: data.nomeHost,
      taxaServico: data.taxaServico ?? 10,
      status: 'ABERTA',
    };
    setMesa(novaMesa);

    // Host registrado
    const hostPart: ParticipanteRadar = {
      id: 1,
      nome: data.nomeHost,
      statusQuitacao: 'CONFIRMADO',
      valorFinal: 0,
    };
    setParticipantes([hostPart]);
    setVisaoAtual('HOST');
  };

  // Lançamento Colaborativo de Itens (tanto Host quanto Convidado podem lançar)
  const handleAddItem = (itemInput: ItemComandaInput) => {
    setItens((prev) => {
      const precoUnit = itemInput.valorTotal / itemInput.quantidade;
      const indexExistente = prev.findIndex(
        (i) =>
          i.descricao.toLowerCase() === itemInput.descricao.toLowerCase() &&
          Math.abs(i.valorTotal / i.quantidade - precoUnit) < 0.01
      );

      if (indexExistente >= 0) {
        const itemExistente = prev[indexExistente];
        const novaQtd = itemExistente.quantidade + itemInput.quantidade;
        const novoTotal = parseFloat((itemExistente.valorTotal + itemInput.valorTotal).toFixed(2));
        const atualizados = [...prev];
        atualizados[indexExistente] = {
          ...itemExistente,
          quantidade: novaQtd,
          valorTotal: novoTotal,
        };
        return atualizados;
      }

      const newItem: ItemComanda = {
        id: Date.now(),
        descricao: itemInput.descricao,
        quantidade: itemInput.quantidade,
        valorTotal: itemInput.valorTotal,
      };
      return [...prev, newItem];
    });
  };

  const handleRemoverItem = (itemId: number) => {
    setItens((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Convidado declara que fez o Pix
  const handleDeclararPago = (nomeConvidado: string, valor: number) => {
    setParticipantes((prev) => {
      const index = prev.findIndex((p) => p.nome.toLowerCase() === nomeConvidado.toLowerCase());
      if (index >= 0) {
        const atualizados = [...prev];
        atualizados[index] = {
          ...atualizados[index],
          statusQuitacao: 'DECLAROU_PAGO',
          valorFinal: valor,
        };
        return atualizados;
      }
      return [
        ...prev,
        {
          id: Date.now(),
          nome: nomeConvidado,
          statusQuitacao: 'DECLAROU_PAGO',
          valorFinal: valor,
        },
      ];
    });
  };

  // Host confirma recebimento do Pix com 1 toque
  const handleConfirmarPagamento = (participanteId: number) => {
    setParticipantes((prev) =>
      prev.map((p) => (p.id === participanteId ? { ...p, statusQuitacao: 'CONFIRMADO' } : p))
    );
  };

  // Host marca pagamento em dinheiro
  const handleMarcarPagoDinheiro = (participanteId: number) => {
    setParticipantes((prev) =>
      prev.map((p) => (p.id === participanteId ? { ...p, statusQuitacao: 'CONFIRMADO' } : p))
    );
  };

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-start p-3 sm:p-5 font-sans">
      <div className="w-full max-w-[420px] space-y-4">
        {/* Header RachaAI Noturno */}
        <header className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] animate-pulse"></span>
            <span className="font-mono font-bold tracking-wider text-base text-white">
              RACHA<span className="text-[#FACC15]">AI</span>
            </span>
          </div>

          {mesa && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMostrarModalCompartilhar(true)}
                className="px-2.5 py-1 bg-[#151518] hover:bg-[#202026] text-[#FACC15] border border-[#FACC15]/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow"
              >
                <Share2 size={13} />
                <span>{mesa.codigoHash}</span>
              </button>
            </div>
          )}
        </header>

        {/* Barra de Alternância de Visões (Para testes instantâneos em Localhost) */}
        {mesa && (
          <div className="bg-[#151518] border border-[#23232A] rounded-2xl p-1 flex items-center justify-between shadow">
            <button
              type="button"
              onClick={() => setVisaoAtual('HOST')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                visaoAtual === 'HOST'
                  ? 'bg-[#FACC15] text-[#0A0A0C] shadow'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Crown size={14} />
              👑 Anfitrião ({mesa.nomeHost})
            </button>
            <button
              type="button"
              onClick={() => setVisaoAtual('CONVIDADO')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                visaoAtual === 'CONVIDADO'
                  ? 'bg-[#FACC15] text-[#0A0A0C] shadow'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Users size={14} />
              👥 Convidado
            </button>
          </div>
        )}

        {/* Modal de Compartilhamento / QR Code */}
        {mostrarModalCompartilhar && mesa && (
          <CompartilharMesa
            codigoHash={mesa.codigoHash}
            nomeHost={mesa.nomeHost}
            chavePixHost={mesa.chavePixHost}
            taxaServico={mesa.taxaServico}
            itens={itens}
            onFechar={() => setMostrarModalCompartilhar(false)}
          />
        )}

        {/* 1. Criar Mesa (Apenas se a mesa ainda não foi criada) */}
        {!mesa && <CriarMesaForm onSubmit={handleCriarMesa} />}

        {/* 2. Cockpit do Anfitrião (Visão de Recebimento, Métricas, Radar e Itens) */}
        {mesa && visaoAtual === 'HOST' && (
          <PainelHost
            codigoHash={mesa.codigoHash}
            nomeHost={mesa.nomeHost}
            chavePixHost={mesa.chavePixHost}
            taxaServico={mesa.taxaServico}
            itens={itens}
            participantes={participantes}
            onAddItem={handleAddItem}
            onRemoverItem={handleRemoverItem}
            onConfirmarPagamento={handleConfirmarPagamento}
            onMarcarPagoDinheiro={handleMarcarPagoDinheiro}
            onAbrirCompartilhar={() => setMostrarModalCompartilhar(true)}
            onAlternarParaConvidado={() => setVisaoAtual('CONVIDADO')}
          />
        )}

        {/* 3. Telas do Convidado (Entrada -> Comanda Colaborativa -> Pagamento Pix com Copiar Chave -> Status) */}
        {mesa && visaoAtual === 'CONVIDADO' && (
          <PainelConvidado
            codigoHash={mesa.codigoHash}
            nomeHost={mesa.nomeHost}
            chavePixHost={mesa.chavePixHost}
            taxaServico={mesa.taxaServico}
            itens={itens}
            onAddItem={handleAddItem}
            onDeclararPago={handleDeclararPago}
            onVoltarParaHost={() => setVisaoAtual('HOST')}
          />
        )}
      </div>
    </main>
  );
};

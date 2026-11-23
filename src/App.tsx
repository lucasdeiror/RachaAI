import React, { useState, useEffect } from 'react';
import { CriarMesaForm, CriarMesaData } from './components/CriarMesaForm';
import { ItemComandaInput } from './components/CalculadoraComanda';
import { ItemComanda } from './components/SelecaoConsumo';
import { ParticipanteRadar } from './components/RadarQuitacao';
import { CompartilharMesa } from './components/CompartilharMesa';
import { PainelHost } from './components/PainelHost';
import { PainelConvidado } from './components/PainelConvidado';
import { Logo } from './components/Logo';
import { InstalarApp } from './components/InstalarApp';
import { useNovaVersao } from './hooks/usePwa';
import { Share2, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [mesa, setMesa] = useState<any>(null);
  const [itens, setItens] = useState<ItemComanda[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteRadar[]>([]);
  const [mostrarModalCompartilhar, setMostrarModalCompartilhar] = useState(false);
  const [visaoAtual, setVisaoAtual] = useState<'HOST' | 'CONVIDADO'>('HOST');

  const { novaVersao, atualizar } = useNovaVersao();

  // Separação estrita de rotas na entrada:
  // 1. Sem parâmetro -> Cai como HOST (Criar Mesa)
  // 2. Com parâmetro (?mesa=...) -> Cai como CONVIDADO
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mesaParam = params.get('mesa');
      const papelParam = params.get('papel');
      const hostParam = params.get('host');
      const pixParam = params.get('pix');
      const taxaParam = params.get('taxa');
      const itensParam = params.get('itens');

      if (mesaParam) {
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
      } else {
        // Entrada própria: Cai como Host
        setVisaoAtual('HOST');
      }
    }
  }, []);

  // Criar mesa como Host
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

    // Host registrado como credor
    const hostPart: ParticipanteRadar = {
      id: 1,
      nome: data.nomeHost,
      statusQuitacao: 'CONFIRMADO',
      valorFinal: 0,
    };
    setParticipantes([hostPart]);
    setVisaoAtual('HOST');
  };

  // Convidado ou Host decide criar uma sala própria
  const handleCriarNovaMesa = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
    setMesa(null);
    setItens([]);
    setParticipantes([]);
    setVisaoAtual('HOST');
  };

  // Lançamento Colaborativo de Itens
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

  // Convidado declara pagamento
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

  // Host confirma recebimento do Pix em 1 toque
  const handleConfirmarPagamento = (participanteId: number) => {
    setParticipantes((prev) =>
      prev.map((p) => (p.id === participanteId ? { ...p, statusQuitacao: 'CONFIRMADO' } : p))
    );
  };

  // Host marca em dinheiro
  const handleMarcarPagoDinheiro = (participanteId: number) => {
    setParticipantes((prev) =>
      prev.map((p) => (p.id === participanteId ? { ...p, statusQuitacao: 'CONFIRMADO' } : p))
    );
  };

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-start p-3 sm:p-5 font-sans">
      <div className="w-full max-w-[420px] space-y-4">
        {/* Banner de Atualização PWA */}
        {novaVersao && (
          <div className="bg-[#FACC15] text-[#0A0A0C] p-3 rounded-2xl flex items-center justify-between shadow-lg text-xs font-bold animate-in fade-in">
            <span>Nova versão disponível!</span>
            <button
              type="button"
              onClick={atualizar}
              className="px-3 py-1 bg-[#0A0A0C] text-[#FACC15] rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw size={12} /> Atualizar
            </button>
          </div>
        )}

        {/* Header RachaAI com Logo e Ações */}
        <header className="flex justify-between items-center px-1">
          <Logo size="md" />

          <div className="flex items-center gap-2">
            <InstalarApp />

            {mesa && (
              <button
                type="button"
                onClick={() => setMostrarModalCompartilhar(true)}
                className="px-2.5 py-1 bg-[#151518] hover:bg-[#202026] text-[#FACC15] border border-[#FACC15]/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow"
                title="Compartilhar mesa"
              >
                <Share2 size={13} />
                <span>{mesa.codigoHash}</span>
              </button>
            )}
          </div>
        </header>

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

        {/* 1. Visão Host: Criar Mesa (Entrada própria sem mesa ativa) */}
        {!mesa && <CriarMesaForm onSubmit={handleCriarMesa} />}

        {/* 2. Cockpit do Anfitrião (Host com mesa aberta) */}
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
            onEncerrarMesa={handleCriarNovaMesa}
          />
        )}

        {/* 3. Visão do Convidado (Entrou por link compartilhado) */}
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
            onCriarNovaMesa={handleCriarNovaMesa}
          />
        )}
      </div>
    </main>
  );
};

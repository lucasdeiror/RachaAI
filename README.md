# 🍻 RachaAI — Rateio Inteligente de Contas & Bares

> **RachaAI** é uma aplicação web mobile-first para divisão rápida de contas de bares, restaurantes e rolês. Desenvolvida para uso real pelo celular, com foco em **zero atrito**, sem necessidade de cadastro ou download de aplicativo pelos convidados.

---

## ⚡ Principais Funcionalidades

1. **Abertura Expressa (Cockpit do Host):**
   - Criação da mesa em 15 segundos (apenas nome do anfitrião e chave Pix).
   - Taxa de serviço configurável (0%, 10%, 12%, 15%).
   - Gerador de código de mesa e link/QR Code compartilhável no WhatsApp.
   - Radar de Quitação com confirmação de recebimento em 1 toque.
   - O Anfitrião é o credor da conta e nunca é induzido a pagar Pix para si mesmo.

2. **Comanda Colaborativa:**
   - Lançamento rápido de itens com cálculo automático: `> [produto] [quantidade] [valor unitário] [+]`.
   - Tanto o Anfitrião quanto os Convidados podem adicionar consumos à mesa.

3. **Divisão Aberta de Itens (Convidado):**
   - O convidado pode informar livremente em quantas pessoas dividiu cada porção ou rodada (ex: `÷ 2`, `÷ 3`, `÷ 4` ou qualquer número inteiro).
   - Cálculo exato centavo a centavo com taxa proporcional.

4. **Pagamento Pix Nativo:**
   - Cópia da chave Pix e gerador de código EMV / BR Code com CRC-16 CCITT.
   - Botão de 60px de alto contraste para cópia instantânea no celular.
   - Notificação ao host com confirmação visual de quitação.

---

## 🎨 Design System: Madrugada Viva

- **Paleta de Alto Contraste para Bares e Ambientes Escuros:**
  - Fundo Deep Charcoal: `#0A0A0C`
  - Superfícies Elevadas: `#151518` / `#202026`
  - Destaque Noturno (Amarelo Neon/Dourado): `#FACC15`
  - Feedback Sucesso (Esmeralda): `#34D399`
  - Alerta/Pendente (Laranja Vivo): `#FB923C`
- **Tipografia:** Sans-serif moderna com números monoespaçados (`font-mono`, `tabular-nums`) para clareza financeira.

---

## 🛠️ Tecnologias

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend (Opcional / API REST):** Java 21, Spring Boot 3, Clean Architecture, JUnit 5 / Mockito (localizado em `/backend`).
- **Deploy:** Vercel (Edge Network).

---

## 🚀 Como Rodar Localmente

### Frontend
```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Rodar testes automatizados (Vitest)
npm test

# Build de produção
npm run build
```

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```

---

## 📱 Testando no Celular

Ao abrir o app pelo celular, você pode criar uma mesa e compartilhar o link diretamente via WhatsApp ou apontar a câmera para o QR Code gerado na mesa do bar.

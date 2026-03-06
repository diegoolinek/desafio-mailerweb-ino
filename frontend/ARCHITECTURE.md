# Arquitetura e Decisões Técnicas do Frontend

Este documento detalha as escolhas arquiteturais para a interface de usuário (SPA - Single Page Application) do sistema de reservas, com foco em performance, tipagem estática e experiência do usuário (UX).

## 1. Stack Tecnológica
- **Ferramenta de Build:** Vite (mais rápido e leve que o Create React App)
- **Biblioteca Core:** React 18 + TypeScript
- **Estilização:** Tailwind CSS v4
- **Roteamento:** React Router DOM v6
- **Data Fetching & Cache:** TanStack Query (React Query) + Axios
- **Formulários:** React Hook Form
- **Validação de Esquemas:** Zod
- **Ícones:** Lucide React

---

## 2. Gerenciamento de Estado de Servidor e API
Em aplicações modernas, a maior parte do "estado" global é na verdade um espelho do banco de dados (Server State). 

**A Decisão:** Em vez de usar Redux ou Context API com múltiplos `useState`/`useEffect` para buscar dados, adotamos o **React Query**.
- **Como foi feito:** Toda chamada à API de leitura (`GET` para salas e reservas) usa `useQuery`, enquanto ações de escrita (`POST`, `PATCH`) usam `useMutation`.
- **O Resultado:** Ganhamos automaticamente cache nativo, estados de `isLoading` e `isError`, além da funcionalidade de *Cache Invalidation*. Quando um usuário cria, edita ou cancela uma reserva, invalidamos a chave `['bookings']` e a tela se atualiza sozinha sem recarregar a página (Refetch reativo).

---

## 3. Comunicação com a API e Autenticação (JWT)
O sistema exige autenticação segura baseada em tokens JWT.

**A Decisão:** Criar um cliente HTTP centralizado com interceptadores.
- **Como foi feito:** Configuramos uma instância do **Axios** (`services/api.ts`). Utilizamos um *Request Interceptor* que busca o token no `localStorage` e o injeta no cabeçalho `Authorization: Bearer <token>` de todas as requisições antes delas saírem.
- **Segurança de Sessão:** Um *Response Interceptor* escuta erros `401 Unauthorized`. Se o token expirar, ele limpa a sessão e redireciona o usuário para o login automaticamente.
- **Context API:** O estado do usuário logado (nome, e-mail) é mantido em um `AuthContext` para proteger rotas (`PrivateRoute`).

---

## 4. Formulários e Validação (Client-Side)
Para garantir que dados inválidos não gerem tráfego desnecessário para a API.

**A Decisão:** Usar `React Hook Form` aliado ao `Zod`.
- **Por que não formulários controlados (`useState`)?** O React Hook Form usa componentes não-controlados (via *refs*), o que evita que a página inteira re-renderize a cada tecla digitada.
- **Validação:** O `Zod` cria um esquema de validação rígido (ex: garantindo que "Senha" e "Confirmação de Senha" batam, e validando formatos de data). Se falhar, o erro aparece antes mesmo do formulário ser submetido.

---

## 5. UI/UX e Estilização
A aplicação precisa ser moderna, responsiva e ter um bom feedback visual.

**A Decisão:** Utilizar o **Tailwind CSS v4**.
- **Como foi feito:** Adotamos uma abordagem *Utility-First*, estilizando os componentes diretamente no JSX. O Tailwind v4 dispensa arquivos complexos de configuração (`tailwind.config.js`), integrando-se nativamente ao Vite.
- **Feedback Amigável:** Erros de negócio retornados pelo Django (ex: conflito de horário `overlap`) são interceptados e traduzidos para mensagens claras em português. Substituímos alertas nativos do navegador (`alert`/`confirm`) por Modais customizados com fundo translúcido (backdrop-blur) para manter a imersão na interface Dark Mode.
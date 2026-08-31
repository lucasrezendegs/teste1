# Cadastro com Supabase

Aplicação web de cadastro e login construída com React + Vite e Supabase Auth.

## O que já está pronto

- Cadastro com nome, e-mail, senha e confirmação de senha.
- Login com e-mail e senha.
- Validação básica e indicador visual de força da senha.
- Mensagens de erro e sucesso em português.
- Sessão persistente usando o Supabase Auth.
- Tela de conta ativa com nome e e-mail.
- Logout.
- Tabela `profiles` com RLS e trigger para sincronizar o nome do usuário.

## Tecnologias

- React 19
- Vite 8
- Supabase JS 2

## Configuração local

1. Instale Node.js 22.12 ou superior.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local`.
4. Preencha `VITE_SUPABASE_PUBLISHABLE_KEY` com a chave publicável do projeto.
5. No Supabase, abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e execute.
6. Execute `npm run dev`.

A URL do projeto Supabase já está configurada em `src/App.jsx`. A chave secreta nunca deve ser colocada no frontend, no GitHub ou em um arquivo `.env` versionado.

## E-mail de confirmação

No Supabase, revise **Authentication > URL Configuration** e defina a URL do site usada em desenvolvimento/produção. Para o cadastro exigir confirmação de e-mail, mantenha a opção de confirmação de e-mail habilitada em **Authentication > Providers > Email**.

## Publicação

Para hospedar em qualquer serviço de frontend estático, configure a variável `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente de build e execute `npm run build`. A pasta gerada será `dist`.

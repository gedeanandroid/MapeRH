# 🚀 Guia de Deploy - Vercel

Este projeto está configurado e validado para deploy na Vercel. Siga os passos abaixo.

## 1. Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Projeto salvo no GitHub (ou GitLab/Bitbucket)

## 2. Arquivos de Configuração

Os seguintes arquivos já foram configurados no projeto:

- `vercel.json`: Configura o roteamento para aplicações SPA (Single Page Application).
- `vite.config.ts`: Otimizado para build de produção.
- `tsconfig.json`: Ajustado para excluir arquivos de servidor (Edge Functions) do build frontend.

## 3. Passo a Passo para Deploy

1. **Push para GitHub**
   - Certifique-se de que todas as alterações (incluindo as correções de build recentes) estejam commitadas e enviadas para o repositório remoto.

2. **Importar Projeto na Vercel**
   - Acesse o dashboard da Vercel.
   - Clique em **"Add New..."** -> **"Project"**.
   - Importe seu repositório do GitHub.

3. **Configurações do Projeto**
   - **Framework Preset**: A Vercel deve detectar automaticamente como `Vite`. Se não, selecione `Vite`.
   - **Root Directory**: `MapeRH` (Se o repositório contiver a pasta raiz. Se o repositório JÁ É a pasta MapeRH, deixe como `./`).
     > ⚠️ IMPORTANTE: Como seu projeto parece estar em uma subpasta ou raiz, verifique se o `package.json` está na raiz que você definiu.

4. **Variáveis de Ambiente (Environment Variables)**
   Você PRECISARÁ adicionar as seguintes variáveis durante a importação (copie do seu `.env` local):

   | Nome | Valor (Exemplo) |
   |------|-----------------|
   | `VITE_SUPABASE_URL` | `https://fccyedkmvydxksaacorv.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI...` (Sua chave anon completa) |

5. **Deploy**
   - Clique em **"Deploy"**.
   - A Vercel irá rodar `npm install` e `npm run build`.
   - Se o build passar (como passou no teste local), seu site estará no ar em segundos!

## 4. Solução de Problemas Comuns

- **Erro 404 ao atualizar página**: Certifique-se de que o arquivo `vercel.json` com as regras de rewrite está na raiz do projeto.
- **Erro de Build (TypeScript)**: Verifique se novas alterações não introduziram erros de tipagem rodando `npx tsc --noEmit` localmente antes de enviar.
- **Erro de Edge Functions**: O frontend não deve tentar compilar as funções do Supabase. O `tsconfig.json` já está configurado para excluí-las.

## 5. Webhook (Opcional - CI/CD)

A Vercel fará deploy automático a cada push na branch `main` (ou `master`).

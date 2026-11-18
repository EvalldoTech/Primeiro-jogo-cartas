# Como abrir o projeto no VS Code e subir para o GitHub

Guia curto, do zero até o repositório público. Feito para quem está começando.

## 1. Abrir no VS Code

1. Descompacte `Esmeralda-projeto-completo.zip`. Vai aparecer uma pasta `Esmeralda-projeto-completo` (ou o nome que você deu ao extrair).
2. **Importante:** mantenha a pasta `src` e os arquivos `package.json`, `index.html` dentro da mesma pasta que você abrir no VS Code.
3. No VS Code: **Arquivo → Abrir Pasta** e escolha essa pasta.
4. Terminal integrado (**Ctrl + '**):
   ```
   npm install
   npm run dev
   ```
5. Abra o endereço que aparecer (normalmente `http://localhost:5173`).

## 2. Extensões recomendadas no VS Code

- **ESLint** — aponta erros enquanto você escreve
- **Prettier** — formata o código ao salvar
- **GitLens** — mostra o histórico de cada linha
- **Auto Rename Tag** — renomeia a tag de abertura e fechamento juntas
- **Portuguese (Brazil) Language Pack** — se preferir o VS Code em português

## 3. Comandos do dia a dia

| Comando | O que faz |
| --- | --- |
| `npm run dev` | abre o jogo em modo desenvolvimento |
| `npm test` | roda os 26 testes das regras |
| `npm run build` | gera a versão para publicar (pasta `dist`) |
| `npm run preview` | testa a versão final localmente |

## 4. Subir para o GitHub

**Primeira vez (repositório novo):**

1. Crie o repositório no GitHub. **Não** marque "Add a README" nem ".gitignore" — o projeto já tem os dois.
2. No terminal, dentro da pasta do projeto:
   ```
   git init
   git add .
   git commit -m "versão 0.2: identidade Esmeralda, opções e documentação"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/esmeralda.git
   git push -u origin main
   ```
3. Ao pedir senha, use um **token de acesso pessoal** (GitHub → Settings → Developer settings → Personal access tokens), não a senha da conta.

**Depois disso, a cada mudança:**

```
git add .
git commit -m "descrição curta do que mudou"
git push
```

## 5. Publicar o jogo com link público

A pasta `dist/` é o que você publica.

**Netlify (mais simples):** crie conta, arraste a pasta `dist/` na tela inicial, pronto. O link já vem com HTTPS, que é o que permite instalar no celular.

**Vercel:** importe o repositório do GitHub; ele detecta o Vite sozinho. A cada `git push`, o site atualiza.

**GitHub Pages:** em Settings → Pages, escolha a branch `gh-pages` ou use uma GitHub Action. O projeto já está configurado com `base: './'`, então funciona em subpasta.

## 6. O que NÃO subir

O arquivo `.gitignore` já resolve: `node_modules` (milhares de arquivos, reinstalados com `npm install`) e `dist` (gerado pelo build) ficam de fora. Isso é o padrão da indústria.

## 7. Antes de tornar público

- Troque o nome em `package.json` e no `README.md` se quiser outro.
- Se for usar seu nome no "Sobre", mantenha só o primeiro nome.
- Leia o `README.md` — ele é a primeira coisa que um avaliador abre.

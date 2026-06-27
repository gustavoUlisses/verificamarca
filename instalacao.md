# Guia de instalação

## O que você tem aqui

```
verifica-marca/
├── api/
│   └── busca.js       ← roda na Vercel (Node.js), faz proxy para o INPI sem problema de CORS
├── public/
│   └── index.html     ← o site completo, HTML/CSS/JS puro, sem frameworks
├── vercel.json        ← diz à Vercel como rotear as URLs
└── instalacao.md      ← este arquivo
```

Sem IA. Sem banco de dados. Sem dependências npm. Só um proxy simples e HTML estático.

---

## Passo 1 — Criar conta na Vercel (se não tiver)

Acesse https://vercel.com e crie uma conta gratuita.
O plano Hobby (gratuito) é suficiente para este projeto.

---

## Passo 2 — Subir o projeto no GitHub

### 2.1 Crie um repositório no GitHub

Acesse https://github.com/new e crie um repositório.
Pode deixar privado ou público, tanto faz.

### 2.2 Inicialize o Git na pasta do projeto

Abra o terminal, navegue até a pasta `verifica-marca` e rode:

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

Substitua `SEU_USUARIO` e `SEU_REPO` pelos seus dados do GitHub.

---

## Passo 3 — Deploy na Vercel

### Opção A — Pelo site da Vercel (mais fácil)

1. Acesse https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione o repositório que você criou no passo 2
4. Deixe todas as configurações no padrão
5. Clique em **Deploy**

Pronto. Em menos de 1 minuto você terá uma URL pública do tipo `verifica-marca.vercel.app`.

### Opção B — Pela linha de comando

```bash
npm install -g vercel
cd verifica-marca
vercel
```

Responda as perguntas:
- **Set up and deploy?** → Y
- **Which scope?** → sua conta
- **Link to existing project?** → N
- **What's your project's name?** → verifica-marca (ou o nome que quiser)
- **In which directory is your code located?** → ./
- **Want to override the settings?** → N

---

## Passo 4 — Testar

Acesse a URL que a Vercel gerou, digite um nome e clique em Verificar.

Se aparecer erro "502 — Não foi possível consultar o INPI", o INPI pode estar fora do ar
(isso acontece, o sistema deles é instável). Tente novamente em alguns minutos.

---

## Atualizações futuras

Qualquer alteração que você fizer nos arquivos e subir para o GitHub será publicada
automaticamente na Vercel em segundos — não precisa fazer nada manualmente.

```bash
git add .
git commit -m "descrição da mudança"
git push
```

---

## Domínio próprio (opcional)

1. No painel da Vercel, acesse o projeto → **Settings** → **Domains**
2. Clique em **Add Domain** e digite seu domínio (ex: `verificamarca.com.br`)
3. A Vercel vai mostrar os registros DNS para configurar no seu provedor de domínio
4. Após configurar o DNS, o HTTPS é ativado automaticamente

---

## Perguntas frequentes

**O site retornou erro mas o INPI está funcionando no browser — por quê?**
O sistema do INPI às vezes bloqueia requests automatizados ou muda o endpoint.
Se isso acontecer com frequência, abra uma issue no repositório ou ajuste a URL
em `api/busca.js` (linha com `servicos.busca.inpi.gov.br/api/v2/marcas/pesquisa`).

**Posso hospedar em outro lugar além da Vercel?**
Sim, mas você precisa de um servidor Node.js para rodar `api/busca.js`.
O `public/index.html` por si só não funciona sem o proxy (CORS bloqueia chamadas diretas ao INPI).
Alternativas: Railway, Render, Fly.io — todos têm plano gratuito.

**Preciso pagar alguma coisa?**
Não. Vercel Hobby é gratuito, o INPI é público, e não há IA ou APIs pagas aqui.

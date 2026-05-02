# Alma Retrô - Catálogo Online

Um site de catálogo elegante e moderno para o brechó Alma Retrô, desenvolvido com Flask, HTML, CSS e JavaScript puro.

## 🎨 Características

- **Design Retrô Moderno**: Visual elegante com paleta de cores bege/creme, preto e vermelho queimado
- **Responsivo**: Layout mobile-first, adaptado para todos os dispositivos
- **Modal de Produtos**: Visualização detalhada com informações completas
- **Integração WhatsApp**: Botão fixo e links automáticos para contato
- **Animações Suaves**: Transições elegantes e efeitos de hover
- **Banco de Dados Supabase**: Armazenamento de produtos em nuvem
- **Painel Administrativo**: Gerenciamento completo de produtos com senha protegida

## 📁 Estrutura do Projeto

```
AlmaRetro/
├── app.py                 # Aplicação Flask principal
├── requirements.txt       # Dependências Python
├── schema.sql            # Schema SQL para Supabase
├── .env.example          # Exemplo de variáveis de ambiente
├── templates/            # Templates HTML
│   ├── base.html        # Template base com elementos comuns
│   ├── home.html        # Página inicial
│   ├── catalog.html     # Página de catálogo
│   ├── login.html       # Página de login do admin
│   └── admin.html       # Painel administrativo
└── static/              # Arquivos estáticos
    ├── css/
    │   └── style.css   # Estilos CSS
    ├── js/
    │   └── script.js   # JavaScript
    └── images/         # Imagens (se necessário)
```

## 🚀 Configuração

### 1. Pré-requisitos

- Python 3.8 ou superior
- Conta no Supabase (grátis em supabase.com)
- Git (opcional)

### 2. Clonar o Projeto

```bash
cd c:/Users/px/Documents/AlmaRetro
```

### 3. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > API e copie:
   - Project URL
   - anon public key
4. No SQL Editor do Supabase, execute o arquivo `schema.sql`

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
SUPABASE_URL=sua-url-do-supabase
SUPABASE_KEY=sua-chave-do-supabase
ADMIN_PASSWORD=sua-senha-admin
SECRET_KEY=chave-secreta-para-sessoes
```

**Importante**:
- Substitua `sua-url-do-supabase` e `sua-chave-do-supabase` pelas credenciais reais do seu projeto Supabase
- Defina uma senha segura para `ADMIN_PASSWORD` (será usada para acessar o painel admin)
- `SECRET_KEY` é usado para gerenciar sessões Flask - use uma string aleatória longa

### 5. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 6. Configurar WhatsApp

Edite o número do WhatsApp nos seguintes arquivos:

- `templates/base.html` (linha ~50): substitua `5511999999999` pelo seu número
- `static/js/script.js` (linha ~50): substitua `5511999999999` pelo seu número

Formato: `55` + código do país + DDD + número (ex: 5511999999999)

## 🏃 Executar o Projeto

```bash
python app.py
```

O site estará disponível em: `http://localhost:5000`

## 📱 Rotas

### Públicas
- `/` - Página inicial com produtos em destaque
- `/catalogo` - Catálogo completo de produtos
- `/api/products` - API endpoint para buscar todos os produtos
- `/api/product/<id>` - API endpoint para buscar um produto específico

### Admin
- `/admin` - Painel administrativo (requer login)
- `/admin/login` - Página de login do admin
- `/admin/logout` - Logout do painel admin
- `/admin/product` - Criar novo produto (POST)
- `/admin/product/<id>` - Atualizar produto (PUT) ou deletar (DELETE)
- `/admin/product/<id>/toggle-featured` - Alternar destaque do produto (POST)

## 🎯 Personalização

### Cores

Edite as variáveis CSS em `static/css/style.css`:

```css
:root {
    --color-bg-cream: #F5F0E8;      /* Fundo */
    --color-text-black: #1A1A1A;    /* Texto */
    --color-accent-red: #8B3A3A;    /* Destaques */
}
```

### Adicionar Produtos

No SQL Editor do Supabase:

```sql
INSERT INTO products (name, description, price, size, image_url, featured)
VALUES (
    'Nome do Produto',
    'Descrição detalhada do produto',
    199.90,
    'M',
    'https://url-da-imagem.com',
    TRUE
);
```

### Imagens

- As imagens podem ser hospedadas no bucket do Supabase
- Ou usar URLs externas (Unsplash, Imgur, etc.)
- Recomendado: imagens com proporção 3:4 (ex: 600x800px)

## 🛠️ Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Design**: Mobile-first, CSS Grid, Flexbox

## 📝 Funcionalidades

### Página Inicial (Home)
- Banner com nome e slogan
- Grid com 6 produtos em destaque
- CTA para ver catálogo completo
- Seção de chamada para ação

### Página de Catálogo
- Grid responsivo com todos os produtos
- Cards com imagem, nome e preço
- Botão "Ver mais" para detalhes

### Modal de Produto
- Imagem ampliada
- Nome e descrição
- Preço e tamanho
- Botão "Reservar no WhatsApp" com mensagem automática

### WhatsApp Integration
- Botão fixo no canto inferior direito
- Links automáticos com informações do produto
- Mensagem pré-formatada para facilitar o contato

### Painel Administrativo 🔐
- **Login protegido por senha**: Acesse em `/admin` ou clique em "Admin" no footer
- **Gerenciamento de produtos**: Criar, editar e excluir produtos
- **Modais guiados**: Interface intuitiva para edição rápida
- **Toggle de destaque**: Marque/desmarque produtos como destacados
- **Estatísticas**: Visualize total de produtos e produtos em destaque
- **Tabela responsiva**: Lista completa com ações rápidas

**Como acessar o painel admin:**
1. Acesse `http://localhost:5000/admin` ou clique em "Admin" no footer
2. Digite a senha configurada no `.env` (ADMIN_PASSWORD)
3. Gerencie seus produtos através da interface intuitiva

**Funcionalidades do painel:**
- **Adicionar produto**: Clique em "+ Adicionar Produto" e preencha o formulário
- **Editar produto**: Clique em "Editar" na linha do produto
- **Excluir produto**: Clique em "Excluir" (com confirmação)
- **Alternar destaque**: Clique em "Destacar/Remover Destaque" para mudar o status

## 🐛 Troubleshooting

### Erro de conexão com Supabase
- Verifique se as credenciais no `.env` estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique se as tabelas foram criadas corretamente

### Imagens não carregam
- Verifique se as URLs das imagens estão acessíveis
- Confirme se o bucket do Supabase está público (se usado)
- Teste as URLs diretamente no navegador

### Estilos não aparecem
- Verifique se o arquivo CSS está na pasta correta
- Confirme se o link no HTML está correto
- Limpe o cache do navegador

### Problemas no Painel Admin
- **Senha não funciona**: Verifique se `ADMIN_PASSWORD` está configurado no `.env`
- **Sessão expira**: Isso é normal por segurança, faça login novamente
- **Não consigo acessar /admin**: Verifique se o servidor Flask está rodando
- **Erro ao salvar produto**: Verifique a conexão com Supabase e se todos os campos obrigatórios estão preenchidos

## 📄 Licença

Este projeto é de código aberto e está disponível para uso pessoal e comercial.

## 👤 Contato

Para dúvidas ou suporte, entre em contato via WhatsApp.

---

**Alma Retrô - Estilo com história. Peças únicas.**

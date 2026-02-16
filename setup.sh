#!/bin/bash

# Script de Instalação do Syllab
# Execute: bash setup.sh

echo "🎓 Iniciando instalação do Syllab..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências."
    exit 1
fi

echo "✅ Dependências instaladas com sucesso!"
echo ""

# Criar .env.local se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp .env.local.example .env.local
    echo "✅ Arquivo .env.local criado!"
else
    echo "ℹ️  Arquivo .env.local já existe."
fi

echo ""
echo "✨ Instalação concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Execute o schema SQL no Supabase:"
echo "   - Acesse: https://condominio-supa-academic.yzqq8i.easypanel.host"
echo "   - Vá em 'SQL Editor'"
echo "   - Cole e execute o conteúdo de: database/schema.sql"
echo ""
echo "2. (Opcional) Popule com dados de exemplo:"
echo "   - Execute também: database/seed.sql"
echo ""
echo "3. Inicie o servidor de desenvolvimento:"
echo "   npm run dev"
echo ""
echo "4. Acesse: http://localhost:3000"
echo ""
echo "📚 Para mais informações, consulte INSTALACAO.md"
echo ""

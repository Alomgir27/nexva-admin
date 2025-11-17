#!/bin/bash

echo "🚀 Setting up Nexva Admin..."
echo ""

if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local file..."
  cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENV=development
EOL
  echo "✅ .env.local created"
else
  echo "ℹ️  .env.local already exists"
fi

if [ ! -f .env.production ]; then
  echo "📝 Creating .env.production file..."
  cat > .env.production << EOL
NEXT_PUBLIC_API_URL=https://yueihds3xl383a-5000.proxy.runpod.net
NEXT_PUBLIC_ENV=production
EOL
  echo "✅ .env.production created"
else
  echo "ℹ️  .env.production already exists"
fi

echo ""
echo "🚀 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Available commands:"
echo "  npm run dev           - Development mode (uses .env.local)"
echo "  npm run build         - Build for development"
echo "  npm run build:prod    - Build for production"
echo "  npm start             - Start production server"
echo ""
echo "📝 Configure your production API URL in .env.production before deploying"
echo ""


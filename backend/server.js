import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || '*'
  ],
  credentials: true
}));
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: '🎓 API PlanejAula está rodando!',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Função para conectar ao MongoDB e iniciar servidor
const startServer = async () => {
  try {
    // Verificar se MONGODB_URI existe
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI não encontrada nas variáveis de ambiente');
      process.exit(1);
    }

    // Conectar ao MongoDB
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');

    // Importar rotas APÓS a conexão
    const authRoutes = await import('./src/routes/auth.js');
    const lessonRoutes = await import('./src/routes/lessons.js');

    // Usar rotas
    app.use('/api/auth', authRoutes.default);
    app.use('/api/lessons', lessonRoutes.default);

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});

// Iniciar servidor
startServer();

export default app;
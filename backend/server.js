import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Aceita requisições de qualquer origem em desenvolvimento
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Em desenvolvimento, permitir todas
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Em produção, verificar lista
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
    let authRoutes, lessonRoutes, aiRoutes;
    
    try {
      authRoutes = await import('./src/routes/auth.js');
      console.log('✅ Rotas de auth carregadas');
    } catch (err) {
      console.error('❌ Erro ao carregar auth routes:', err.message);
    }
    
    try {
      lessonRoutes = await import('./src/routes/lessons.js');
      console.log('✅ Rotas de lessons carregadas');
    } catch (err) {
      console.error('❌ Erro ao carregar lesson routes:', err.message);
    }
    
    try {
      aiRoutes = await import('./src/routes/ai.js');
      console.log('✅ Rotas de AI carregadas');
    } catch (err) {
      console.log('⚠️ Rotas de AI não encontradas (opcional)');
    }

    // Usar rotas (apenas se existirem)
    if (authRoutes?.default) {
      app.use('/api/auth', authRoutes.default);
      console.log('✅ /api/auth registrado');
    }
    
    if (lessonRoutes?.default) {
      app.use('/api/lessons', lessonRoutes.default);
      console.log('✅ /api/lessons registrado');
    }
    
    if (aiRoutes?.default) {
      app.use('/api/ai', aiRoutes.default);
      console.log('✅ /api/ai registrado');
    }

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
import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Disciplina é obrigatória'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Turma é obrigatória'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Data é obrigatória']
  },
  duration: {
    type: Number,
    required: [true, 'Duração é obrigatória'],
    min: 15
  },
  objectives: {
    type: String,
    required: [true, 'Objetivos são obrigatórios']
  },
  content: {
    type: String,
    required: [true, 'Conteúdo é obrigatório']
  },
  methodology: {
    type: String,
    required: [true, 'Metodologia é obrigatória']
  },
  resources: {
    type: String,
    default: ''
  },
  evaluation: {
    type: String,
    default: ''
  },
  homework: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['planejado', 'em_andamento', 'concluido'],
    default: 'planejado'
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
lessonSchema.index({ teacher: 1, date: -1 });
lessonSchema.index({ subject: 1, class: 1 });

export default mongoose.model('Lesson', lessonSchema);
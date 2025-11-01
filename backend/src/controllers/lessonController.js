import Lesson from '../models/Lesson.js';

// Criar nova aula
export const createLesson = async (req, res) => {
  try {
    const lessonData = {
      ...req.body,
      teacher: req.user.id
    };

    const lesson = await Lesson.create(lessonData);

    res.status(201).json({
      success: true,
      message: 'Aula criada com sucesso',
      lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar aula',
      error: error.message
    });
  }
};

// Listar todas as aulas do professor
export const getLessons = async (req, res) => {
  try {
    const { subject, class: className, status, startDate, endDate } = req.query;
    
    const filter = { teacher: req.user.id };

    if (subject) filter.subject = subject;
    if (className) filter.class = className;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const lessons = await Lesson.find(filter)
      .sort({ date: -1 })
      .populate('teacher', 'name email');

    res.json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aulas',
      error: error.message
    });
  }
};

// Buscar aula por ID
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.id,
      teacher: req.user.id
    }).populate('teacher', 'name email');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada'
      });
    }

    res.json({
      success: true,
      lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aula',
      error: error.message
    });
  }
};

// Atualizar aula
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Aula atualizada com sucesso',
      lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar aula',
      error: error.message
    });
  }
};

// Deletar aula
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user.id
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Aula deletada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar aula',
      error: error.message
    });
  }
};

// Estatísticas
export const getStats = async (req, res) => {
  try {
    const stats = await Lesson.aggregate([
      { $match: { teacher: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Lesson.countDocuments({ teacher: req.user.id });
    
    const subjects = await Lesson.distinct('subject', { teacher: req.user.id });
    const classes = await Lesson.distinct('class', { teacher: req.user.id });

    res.json({
      success: true,
      stats: {
        total,
        byStatus: stats,
        subjects: subjects.length,
        classes: classes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
};
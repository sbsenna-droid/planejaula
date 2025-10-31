import { useState, useEffect } from 'react';
import { BookOpen, Calendar, PlusCircle, LogOut, User } from 'lucide-react';

const API_URL = 'http://localhost:3000';

function App() {
  const [auth, setAuth] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', school: '' });
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setAuth({ token, user: JSON.parse(user) });
    }
  }, []);

  useEffect(() => {
    if (auth) loadData();
  }, [auth]);

  const loadData = async () => {
    try {
      const [lessonsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/lessons`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        }),
        fetch(`${API_URL}/api/lessons/stats`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      ]);
      
      const lessonsData = await lessonsRes.json();
      const statsData = await statsRes.json();
      
      if (lessonsData.success) setLessons(lessonsData.lessons);
      if (statsData.success) setStats(statsData.stats);
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuth({ token: data.token, user: data.user });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao conectar');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuth(null);
    setLessons([]);
    setStats(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta aula?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/lessons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        setLessons(lessons.filter(l => l._id !== id));
      }
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 mx-auto text-primary-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">PlanejAula</h1>
            <p className="text-gray-600 mt-2">Sistema de Planejamento</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-semibold ${
                isLogin ? 'bg-primary-600 text-white' : 'bg-gray-100'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-semibold ${
                !isLogin ? 'bg-primary-600 text-white' : 'bg-gray-100'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Nome"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Escola"
                  className="input-field"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                />
              </>
            )}
            
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            
            <input
              type="password"
              placeholder="Senha"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold">PlanejAula</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{auth.user.name}</p>
              <p className="text-xs text-gray-500">{auth.user.school}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-600 hover:text-red-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <Calendar className="w-10 h-10 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total de Aulas</p>
            </div>
            <div className="card">
              <BookOpen className="w-10 h-10 text-green-600 mb-2" />
              <p className="text-2xl font-bold">{stats.subjects}</p>
              <p className="text-sm text-gray-600">Disciplinas</p>
            </div>
            <div className="card">
              <User className="w-10 h-10 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{stats.classes}</p>
              <p className="text-sm text-gray-600">Turmas</p>
            </div>
            <div className="card">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 text-primary-600 font-semibold"
              >
                <PlusCircle className="w-6 h-6" />
                Nova Aula
              </button>
            </div>
          </div>
        )}

        {lessons.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma aula</h3>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              Criar Primeira Aula
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="card">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div><strong>Disciplina:</strong> {lesson.subject}</div>
                      <div><strong>Turma:</strong> {lesson.class}</div>
                      <div><strong>Data:</strong> {new Date(lesson.date).toLocaleDateString('pt-BR')}</div>
                      <div><strong>Duração:</strong> {lesson.duration}min</div>
                    </div>
                    <p className="text-gray-700"><strong>Objetivos:</strong> {lesson.objectives}</p>
                    <p className="text-gray-700 mt-2"><strong>Conteúdo:</strong> {lesson.content}</p>
                  </div>
                  <button onClick={() => handleDelete(lesson._id)} className="text-red-600 ml-4">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <LessonForm
          auth={auth}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function LessonForm({ auth, onClose, onSuccess }) {
  const [data, setData] = useState({
    title: '', subject: '', class: '', date: '', duration: 50,
    objectives: '', content: '', methodology: '', resources: '',
    evaluation: '', homework: '', notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${API_URL}/api/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      if (result.success) onSuccess();
      else alert('Erro ao criar aula');
    } catch (err) {
      alert('Erro ao conectar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
        <h2 className="text-2xl font-bold mb-6">Nova Aula</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Título"
            className="input-field"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Disciplina"
              className="input-field"
              value={data.subject}
              onChange={(e) => setData({ ...data, subject: e.target.value })}
            />
            <input
              type="text"
              placeholder="Turma"
              className="input-field"
              value={data.class}
              onChange={(e) => setData({ ...data, class: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              className="input-field"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
            />
            <input
              type="number"
              placeholder="Duração (min)"
              className="input-field"
              value={data.duration}
              onChange={(e) => setData({ ...data, duration: e.target.value })}
            />
          </div>

          <textarea
            placeholder="Objetivos"
            className="input-field h-20"
            value={data.objectives}
            onChange={(e) => setData({ ...data, objectives: e.target.value })}
          />

          <textarea
            placeholder="Conteúdo"
            className="input-field h-24"
            value={data.content}
            onChange={(e) => setData({ ...data, content: e.target.value })}
          />

          <textarea
            placeholder="Metodologia"
            className="input-field h-20"
            value={data.methodology}
            onChange={(e) => setData({ ...data, methodology: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
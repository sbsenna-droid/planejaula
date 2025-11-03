import { useState, useEffect } from 'react';
import { BookOpen, Calendar, PlusCircle, LogOut, Menu, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [auth, setAuth] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setAuth({ token, user: JSON.parse(user) });
    } else {
      // Pular direto pro dashboard sem login
      setAuth({ 
        token: 'test-token', 
        user: { 
          id: '1', 
          name: 'Professor Teste', 
          email: 'teste@example.com',
          school: 'Escola de Teste'
        } 
      });
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
        loadData();
      }
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  // DASHBOARD MOBILE
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-xl font-bold">PlanejAula</h1>
          </div>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transform transition"
          >
            {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {showMenu && (
          <div className="border-t p-4 bg-white">
            <div className="mb-4 pb-4 border-b">
              <p className="font-semibold text-gray-900">{auth.user.name}</p>
              <p className="text-sm text-gray-500">{auth.user.email}</p>
              {auth.user.school && (
                <p className="text-sm text-gray-500">{auth.user.school}</p>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-red-600 font-semibold py-2 px-4 hover:bg-red-50 rounded-lg active:scale-95 transform transition"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        )}
      </header>

      <div className="p-4 pb-24">
        {/* Stats Cards Mobile */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <Calendar className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-600">Total de Aulas</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <BookOpen className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold">{stats.subjects}</p>
              <p className="text-xs text-gray-600">Disciplinas</p>
            </div>
          </div>
        )}

        {/* Lista de Aulas Mobile */}
        {lessons.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma aula ainda</h3>
            <p className="text-gray-500 text-sm mb-4">Comece criando sua primeira aula</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg flex-1">{lesson.title}</h3>
                  <button 
                    onClick={() => handleDelete(lesson._id)} 
                    className="text-red-600 ml-2 p-2 hover:bg-red-50 rounded-lg active:scale-95 transform transition"
                  >
                    🗑️
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disciplina:</span>
                    <span className="font-semibold">{lesson.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Turma:</span>
                    <span className="font-semibold">{lesson.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-semibold">
                      {new Date(lesson.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-700">
                    <strong>Objetivos:</strong> {lesson.objectives.substring(0, 100)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão Fixo de Nova Aula */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transform transition-transform z-40"
      >
        <PlusCircle className="w-8 h-8" />
      </button>

      {/* Modal de Nova Aula */}
      {showForm && (
        <LessonFormMobile
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

// Formulário Mobile
function LessonFormMobile({ auth, onClose, onSuccess }) {
  const [data, setData] = useState({
    title: '', subject: '', class: '', date: '', duration: 50,
    objectives: '', content: '', methodology: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
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
      if (result.success) {
        alert('Aula criada com sucesso!');
        onSuccess();
      } else {
        alert('Erro: ' + result.message);
      }
    } catch (err) {
      alert('Erro ao conectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-center">
        <div className="bg-white rounded-2xl w-full max-w-lg mx-auto p-6 my-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Nova Aula</h2>
            <button onClick={onClose} className="text-gray-500 p-2 active:scale-95 transform transition">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Título da Aula"
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Disciplina"
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none"
                value={data.subject}
                onChange={(e) => setData({ ...data, subject: e.target.value })}
              />
              <input
                type="text"
                placeholder="Turma"
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none"
                value={data.class}
                onChange={(e) => setData({ ...data, class: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
              />
              <input
                type="number"
                placeholder="Duração (min)"
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none"
                value={data.duration}
                onChange={(e) => setData({ ...data, duration: e.target.value })}
              />
            </div>

            <textarea
              placeholder="Objetivos da aula"
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none h-24"
              value={data.objectives}
              onChange={(e) => setData({ ...data, objectives: e.target.value })}
            />

            <textarea
              placeholder="Conteúdo"
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none h-24"
              value={data.content}
              onChange={(e) => setData({ ...data, content: e.target.value })}
            />

            <textarea
              placeholder="Metodologia"
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none h-24"
              value={data.methodology}
              onChange={(e) => setData({ ...data, methodology: e.target.value })}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 active:scale-95 transform transition"
            >
              {loading ? 'Salvando...' : 'Salvar Aula'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
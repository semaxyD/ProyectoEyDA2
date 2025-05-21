import React, { useEffect, useState }from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle,SquareLibrary, NotebookText, BookOpen, CheckSquare} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, getAggregateFromServer, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { TaskStack } from '../utils/TaskStack';
import { SubjectLinkedList } from '../utils/SubjectLinkedList'
import { useNavigate } from 'react-router-dom';
import ProgressOverview from '../components/ProgressOverview';
import { startOfWeek, format } from 'date-fns';


import { inserMockData } from '../insertMockData';

function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState();
  const [avanceGeneral, setAvanceGeneral] = useState(0);
  const [progresoSemanal, setProgresoSemanal] = useState({});

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const userId = user.uid;

    const subjectsQuery = query(
      collection(db, 'subjects'),
      where('userId', '==', userId)
    );
    const unsubscribeSubjects = onSnapshot(subjectsQuery, (subjectsSnapshot) => {
      const subjectsData = subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const subjectList = new SubjectLinkedList();
      subjectsData.forEach((subject) => subjectList.insertSorted(subject));
      setSubjects(subjectList.toArray());
    });

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );
    const unsubscribeTasks = onSnapshot(tasksQuery, (tasksSnapshot) => {
      const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const total = tasksData.length;
      const completadas = tasksData.filter(t => t.completed).length;
      setAvanceGeneral(total > 0 ? (completadas / total) * 100 : 0);

      const taskStack = new TaskStack();
      tasksData.filter(t => !t.completed).forEach((task) => taskStack.push(task));
      setTasks(taskStack.toArray());

      const completadasPorSemana = {};
      tasksData.forEach(task => {
        if (task.completed && task.completedAt) {
          const fecha = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
          const semana = format(startOfWeek(fecha, { weekStartsOn: 1 }), 'yyyy-MM-dd');
          completadasPorSemana[semana] = (completadasPorSemana[semana] || 0) + 1;
        }
      });
      setProgresoSemanal(completadasPorSemana);
    });

    return () => {
      unsubscribeSubjects();
      unsubscribeTasks();
    };
  }, []);

  return (
    <div className="min-h-screen bg-auto p-6 ">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.h1 
          variants={item}
          className="text-4xl mb-4 font-bold gradient-text"
        >
          📈 Bienvenido a tu DashBoard{userName && `, ${userName}`}
        </motion.h1>
        <hr className=" mb-2 h-1 w-full bg-gradient-to-r from-purple-300 to-blue-300 rounded-full border-none shadow-none outline-none" />
        <ProgressOverview progresoSemanal={progresoSemanal} />

        <motion.div 
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* MATERIAS */}
          <div className="glass-card rounded-2xl p-6 transform transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#284dcb]/10">
                <BookOpen className="h-6 w-6 text-[#284dcb]" />
              </div>
              <h2 className="text-xl font-semibold">Resumen de Materias</h2>
            </div>
            <div className="space-y-4">
              {subjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                {subjects.slice(0,3).map((subject) => (
                  <div key={subject.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center hover:scale-[1.01] transition-transform">
                    <div>
                      <h3 className="text-lg font-semibold text-[#284dcb]">{subject.name}</h3>
                      <p className="text-sm text-gray-500">Créditos: {subject.credits}</p>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#585858]">No hay materias registradas</p>
              )}
              <Button
                onClick={() => navigate('/subjects')} 
                className="w-full bg-gradient-to-r from-[#284dcb] to-[#4168e3] hover:opacity-90 transition-opacity"
              >
                <SquareLibrary className="mr-2 h-4 w-4 text-white" />
                <p className='text-white'>Ver todas las materias</p>
              </Button>
            </div>
          </div>
          
          {/*TAREAS*/}
          <div className="glass-card rounded-2xl p-6 transform transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#284dcb]/10">
                <CheckSquare className="h-6 w-6 text-[#284dcb]" />
              </div>
              <h2 className="text-xl font-semibold">Tareas Pendientes</h2>
            </div>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                {tasks.slice(0,3).map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center hover:scale-[1.01] transition-transform">
                    <div>
                      <h3 className="text-lg font-semibold text-[#284dcb]">{task.title}</h3>
                      <p className="text-sm text-gray-600">
                        Pertenece a {
                          subjects.find(s => s.id === task.subjectId)?.name || 'Sin materia'
                        }
                      </p>
                      <p className="text-sm text-gray-500">Prioridad: {task.priority || 'Sin prioridad'}</p>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#585858]">No hay tareas pendientes 👌💨</p>
              )}
              <Button
                onClick={() => navigate('/tasks')} 
                className="w-full bg-gradient-to-r from-[#284dcb] to-[#4168e3] hover:opacity-90 transition-opacity"
              >
                <NotebookText className="mr-2 h-4 w-4 text-white" />
                <p className='text-white'>Ver todas las tareas</p>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
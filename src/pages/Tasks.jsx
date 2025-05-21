import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import TaskForm from '../components/tasks/TaskForm';
import TaskItem from '../components/tasks/TaskItem';
import { Plus, Filter, Sparkles } from 'lucide-react';
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentStat, setCurrentStat] = useState('');

  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy(sortBy === 'createdAt' ? 'createdAt' : 'dueDate', 'asc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [user, sortBy]);

  const filteredTasks = tasks.filter((task) => {
    if (!task || !task.id) return false;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const priorityOrder = { alta: 0, media: 1, baja: 2 };
  const sortedTasks = sortBy === 'priority'
    ? [...filteredTasks].sort((a, b) => {
        const pa = priorityOrder[a.priority] ?? 3;
        const pb = priorityOrder[b.priority] ?? 3;
        return pa - pb;
      })
    : filteredTasks;

  const handleTaskAdded = (newTask) => {
    if (!newTask.id) {
      console.error('La tarea no tiene un ID válido');
      return;
    }
    setTasks((prevTasks) => {
      const exists = prevTasks.some(task => task.id === newTask.id);
      if (exists) {
        return prevTasks.map(task => task.id === newTask.id ? newTask : task);
      }
      return [...prevTasks, newTask];
    });
    setShowForm(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const calculateTaskStats = () => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(endOfWeek);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    
    const tasksThisMonth = tasks.filter(task => {
      const taskDate = task.completedAt?.toDate?.() || task.createdAt?.toDate?.();
      return taskDate >= startOfCurrentMonth && taskDate <= endOfCurrentMonth;
    });
    
    const tasksThisWeek = tasks.filter(task => {
      const taskDate = task.completedAt?.toDate?.() || task.createdAt?.toDate?.();
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });

    const tasksLastWeek = tasks.filter(task => {
      const taskDate = task.completedAt?.toDate?.() || task.createdAt?.toDate?.();
      return taskDate >= lastWeekStart && taskDate <= lastWeekEnd;
    });
    
    const completedThisMonth = tasksThisMonth.filter(task => task.completed);
    const completedThisWeek = tasksThisWeek.filter(task => task.completed);
    const completedLastWeek = tasksLastWeek.filter(task => task.completed);
    
    const highPriorityCompleted = tasks.filter(task => 
      task.completed && task.priority === 'alta'
    ).length;
    
    const mediumPriorityCompleted = tasks.filter(task =>
      task.completed && task.priority === 'media'
    ).length;

    let currentStreak = 0;
    let checkingDate = new Date();
    while (true) {
      const tasksCompletedOnDay = tasks.filter(task => {
        const completedDate = task.completedAt?.toDate?.();
        return completedDate && format(completedDate, 'yyyy-MM-dd') === format(checkingDate, 'yyyy-MM-dd');
      }).length;
      
      if (tasksCompletedOnDay > 0) {
        currentStreak++;
        checkingDate.setDate(checkingDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    const oldestPending = tasks
      .filter(task => !task.completed)
      .sort((a, b) => a.createdAt?.toDate?.() - b.createdAt?.toDate?.())[0];
    
    const stats = [];
    
    if (tasksThisMonth.length > 0) {
      const completionRate = Math.round((completedThisMonth.length / tasksThisMonth.length) * 100);
      stats.push(`Has completado el ${completionRate}% de tus tareas este mes, ¡sigue así!`);
    }
    
    if (completedThisWeek.length > 0 && completedLastWeek.length > 0) {
      const difference = completedThisWeek.length - completedLastWeek.length;
      if (difference > 0) {
        stats.push(`¡Esta semana has completado ${difference} tareas más que la semana pasada!`);
      } else if (difference < 0) {
        stats.push(`Esta semana has completado ${Math.abs(difference)} tareas menos que la semana pasada. ¡Tú puedes!`);
      }
    }

    if (currentStreak > 0) {
      if (currentStreak === 1) {
        stats.push("¡Has completado tareas hoy! ¿Podrás mantener la racha mañana?");
      } else {
        stats.push(`¡Llevas ${currentStreak} días seguidos completando tareas! ¡Increíble racha!`);
      }
    }
    
    if (highPriorityCompleted > 0) {
      stats.push(`¡Has completado ${highPriorityCompleted} tareas de alta prioridad!`);
    }
    
    if (mediumPriorityCompleted > 0) {
      stats.push(`Has completado ${mediumPriorityCompleted} tareas de prioridad media. ¡Buen trabajo!`);
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    if (totalTasks > 0) {
      const efficiency = Math.round((completedTasks / totalTasks) * 100);
      if (efficiency >= 75) {
        stats.push(`¡Tu eficiencia en completar tareas es del ${efficiency}%! ¡Eres una máquina!`);
      } else if (efficiency >= 50) {
        stats.push(`Tu eficiencia en completar tareas es del ${efficiency}%. ¡Vamos por más!`);
      }
    }
    
    if (oldestPending) {
      const daysOld = differenceInDays(now, oldestPending.createdAt?.toDate?.() || now);
      if (daysOld > 0) {
        if (daysOld > 7) {
          stats.push(`¡Ups! Tienes una tarea pendiente desde hace ${daysOld} días. ¿Necesitas ayuda para organizarla?`);
        } else {
          stats.push(`Tu tarea más antigua pendiente tiene ${daysOld} días. ¡Tú puedes completarla!`);
        }
      }
    }
    
    const completedToday = tasks.filter(task => {
      const completedDate = task.completedAt?.toDate?.();
      return completedDate && format(completedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    }).length;
    
    if (completedToday > 0) {
      if (completedToday >= 3) {
        stats.push(`¡Wow! ¡Hoy has completado ${completedToday} tareas! ¡Eres un/a campeón/a!`);
      } else {
        stats.push(`¡Hoy has completado ${completedToday} tarea${completedToday !== 1 ? 's' : ''}! ¡Sigue así!`);
      }
    }
    
    const pendingHighPriority = tasks.filter(task => !task.completed && task.priority === 'alta').length;
    if (pendingHighPriority > 0) {
      stats.push(`Tienes ${pendingHighPriority} tarea${pendingHighPriority !== 1 ? 's' : ''} de alta prioridad pendiente${pendingHighPriority !== 1 ? 's' : ''}. ¡Enfócate en ellas!`);
    }

    if (tasksThisWeek.length > 0) {
      const weeklyProgress = Math.round((completedThisWeek.length / tasksThisWeek.length) * 100);
      if (weeklyProgress >= 80) {
        stats.push(`¡Esta semana has completado el ${weeklyProgress}% de tus tareas! ¡Espectacular!`);
      } else if (weeklyProgress >= 50) {
        stats.push(`Esta semana has completado el ${weeklyProgress}% de tus tareas. ¡Vamos por más!`);
      }
    }
    
    if (stats.length === 0) {
      const motivationalMessages = [
        "¡Cada tarea completada es un paso hacia tus metas!",
        "¡Hoy es un gran día para empezar!",
        "La organización es la clave del éxito.",
        "Pequeños pasos, grandes logros.",
        "¡Tú puedes con todo lo que te propongas!"
      ];
      stats.push(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    }
    
    return stats[Math.floor(Math.random() * stats.length)];
  };

  const handleShowStats = () => {
    const stat = calculateTaskStats();
    setCurrentStat(stat);
    setShowStatsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-violet-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Tareas</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nueva Tarea
          </button>
        </div>

        {showForm && (
          <TaskForm onTaskAdded={handleTaskAdded} />
        )}

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las tareas</option>
                <option value="active">Tareas pendientes</option>
                <option value="completed">Tareas completadas</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dueDate">Ordenar por fecha</option>
                <option value="priority">Ordenar por prioridad</option>
                <option value="createdAt">Ordenar por creación</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              {sortedTasks.length} tarea{sortedTasks.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {sortedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay tareas {filter !== 'all' && 'con este filtro'}
              </div>
            ) : (
              sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              ))
            )}
          </div>
        </div>
      </motion.div>
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={handleShowStats}
          className="rounded-full bg-gradient-to-r from-[#284dcb] to-[#4168e3] p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="Ver estadísticas curiosas"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </button>
      </div>
      
      {showStatsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowStatsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-[#284dcb] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                ¡Dato Curioso!
              </h3>
              <p className="text-gray-600 mb-6">
                {currentStat}
              </p>
              <button
                onClick={() => setShowStatsModal(false)}
                className="bg-gradient-to-r from-[#284dcb] to-[#4168e3] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                ¡Genial!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Tasks;
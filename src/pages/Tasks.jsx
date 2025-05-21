import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import TaskForm from '../components/tasks/TaskForm';
import TaskItem from '../components/tasks/TaskItem';
import { Plus, Filter } from 'lucide-react';

function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

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
    </div>
  );
}

export default Tasks;
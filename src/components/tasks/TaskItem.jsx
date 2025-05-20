import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle2, Circle, Trash2, AlertCircle, Paperclip, Play, Pause } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TaskForm from './TaskForm';

function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [subjectName, setSubjectName] = useState('');
  const { user } = useAuth();
  const [isTiming, setIsTiming] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  
  useEffect(() => {
    
    const saved = localStorage.getItem(`timer_${task.id}`);
    if (saved) {
      const { running, startTime, elapsed } = JSON.parse(saved);
      if (running) {
        const now = Date.now();
        setTimer(Math.floor((now - startTime) / 1000 + (elapsed || 0)));
        setIsTiming(true);
        const id = setInterval(() => {
          setTimer(prev => prev + 1);
        }, 1000);
        setIntervalId(id);
      } else {
        setTimer(elapsed || 0);
      }
    } else {
      setTimer(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    
  }, [task.id]);

  
  useEffect(() => {
    localStorage.setItem(
      `timer_${task.id}`,
      JSON.stringify({
        running: isTiming,
        startTime: isTiming ? Date.now() - timer * 1000 : null,
        elapsed: timer,
      })
    );
  }, [isTiming, timer, task.id]);

  const startTimer = () => {
    setIsTiming(true);
    const id = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = async () => {
    setIsTiming(false);
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    
    const minutes = Math.round(timer / 60);
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, { actualTime: minutes });
      onTaskUpdated({ ...task, actualTime: minutes });
      
      localStorage.removeItem(`timer_${task.id}`);
    } catch (error) {
      console.error('Error al guardar el tiempo real:', error);
    }
  };

  useEffect(() => {
    async function fetchSubject() {
      if (task.subjectId) {
        try {
          const subjectDoc = await getDoc(doc(db, 'subjects', task.subjectId));
          if (subjectDoc.exists()) {
            setSubjectName(subjectDoc.data().name || task.subjectId);
          } else {
            setSubjectName(task.subjectId);
          }
        } catch {
          setSubjectName(task.subjectId);
        }
      }
    }
    fetchSubject();
  }, [task.subjectId]);

  const handleToggleComplete = async () => {
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
      });
      onTaskUpdated({ ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : null });
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        const taskRef = doc(db, 'tasks', task.id);
        await deleteDoc(taskRef);
        onTaskDeleted(task.id);
      } catch (error) {
        console.error('Error al eliminar la tarea:', error);
      }
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const priorityColors = {
    baja: 'bg-green-100 text-green-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-red-100 text-red-800',
  };

  if (isEditing) {
    return (
      <TaskForm
        onTaskAdded={(updatedTask) => {
          onTaskUpdated({ ...task, ...updatedTask });
          setIsEditing(false);
        }}
        initialData={task}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-md p-4 ${
        task.completed ? 'opacity-75' : ''
      } ${isOverdue ? 'border-l-4 border-red-500' : ''}`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggleComplete}
          className="mt-1 text-gray-400 hover:text-blue-500 transition-colors"
        >
          {task.completed ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <Circle className="h-6 w-6" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`text-lg font-medium ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  priorityColors[task.priority]
                }`}
              >
                {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
              </span>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Editar tarea"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.263-1.263l1-4a4 4 0 01.828-1.414z" /></svg>
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-1 text-sm ${
                task.completed ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className={isOverdue ? 'text-red-500' : 'text-gray-500'}>
              {task.dueDate && !isNaN(new Date(task.dueDate)) ? (
                <>
                  <AlertCircle className="h-4 w-4 inline" />{' '}
                  {format(new Date(task.dueDate), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                </>
              ) : (
                'Sin fecha'
              )}
            </span>
            {task.reminderDate && !isNaN(new Date(task.reminderDate)) && (
              <span className="text-blue-500">
                Recordatorio: {format(new Date(task.reminderDate), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
              </span>
            )}
            {subjectName && (
              <span className="text-purple-600">Materia: {subjectName}</span>
            )}
            {typeof task.estimatedTime === 'number' && (
              <span className="text-gray-500">Estimado: {task.estimatedTime} min</span>
            )}
            {typeof task.actualTime === 'number' && (
              <span className="text-gray-500">Real: {task.actualTime} min</span>
            )}
            {/* Mostrar cronómetro solo si la tarea NO está completada */}
            {!task.completed && (
              <span className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Cronómetro:</span>
                <span className="font-mono">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                {!isTiming ? (
                  <button onClick={startTimer} className="text-green-600 hover:text-green-800" title="Iniciar cronómetro"><Play /></button>
                ) : (
                  <button onClick={stopTimer} className="text-red-600 hover:text-red-800" title="Detener y guardar cronómetro"><Pause /></button>
                )}
              </span>
            )}
            {task.completed && task.completedAt && !isNaN(new Date(task.completedAt)) && (
              <span className="text-green-600">Completada el {format(new Date(task.completedAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}</span>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <Paperclip className="h-4 w-4 text-gray-500" />
              {task.attachments.map((name, idx) => (
                <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{name}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TaskItem;
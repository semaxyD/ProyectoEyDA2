import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { addDoc, updateDoc, doc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import InputWithLabel from '../ui/inputWithLabel';

function TaskForm({ onTaskAdded, initialData = null }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState(initialData?.attachments || []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData
      ? {
          ...initialData,
          dueDate: initialData.dueDate
            ? new Date(initialData.dueDate).toISOString().slice(0, 16)
            : '',
          reminderDate: initialData.reminderDate
            ? new Date(initialData.reminderDate).toISOString().slice(0, 16)
            : '',
          subjectId: initialData.subjectId ? String(initialData.subjectId) : '',
        }
      : {},
  });

  useEffect(() => {
    console.log('Usuario autenticado:', user);
    const fetchSubjects = async () => {
      if (!user) {
        console.warn('No hay usuario autenticado, no se pueden cargar materias');
        return;
      }
      try {
        
        const q = query(
          collection(db, 'subjects'),
          where('userId', '==', user.uid),
          where('isActive', '==', true)
        );
        console.log('Query de materias:', q);
        const snapshot = await getDocs(q);
        const subjectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Materias cargadas:', subjectsData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error al cargar materias:', error);
        setError('Error al cargar las materias');
      }
    };
    fetchSubjects();
  }, [user]);

  useEffect(() => {
    if (initialData && initialData.subjectId) {
      setValue('subjectId', String(initialData.subjectId));
    }
  }, [initialData, setValue, subjects.length]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      
      if (!data.subjectId) {
        setError('Debes seleccionar una materia');
        setIsSubmitting(false);
        return;
      }

     
      const subjectExists = subjects.some(subject => subject.id === data.subjectId);
      if (!subjectExists) {
        setError('La materia seleccionada no es válida');
        setIsSubmitting(false);
        return;
      }

      console.log('Materia seleccionada:', subjects.find(s => s.id === data.subjectId));

      const taskData = {
        ...data,
        userId: user.uid,
        updatedAt: serverTimestamp(),
        dueDate: new Date(data.dueDate).toISOString(),
        reminderDate: data.reminderDate ? new Date(data.reminderDate).toISOString() : null,
        estimatedTime: Number(data.estimatedTime) || 0,
        subjectId: data.subjectId,
        subjectName: subjects.find(s => s.id === data.subjectId)?.name || '', 
        attachments,
        tags: tags || [],
      };

      console.log('Datos completos a guardar:', taskData);

      if (initialData && initialData.id) {
        const taskRef = doc(db, 'tasks', initialData.id);
        await updateDoc(taskRef, taskData);
        onTaskAdded({ ...initialData, ...taskData, id: initialData.id });
      } else {
        taskData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'tasks'), taskData);
        const newTask = { ...taskData, id: docRef.id };
        console.log('Nueva tarea creada:', newTask);
        onTaskAdded(newTask);
        reset();
        setAttachments([]);
        setTags([]);
      }
    } catch (err) {
      console.error('Error completo al guardar tarea:', err);
      setError('Error al guardar la tarea: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files.map(f => f.name)]);
  };

  const removeAttachment = (name) => {
    setAttachments(prev => prev.filter(a => a !== name));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Nueva Tarea</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputWithLabel
          id="title"
          label="Título"
          type="text"
          error={errors.title && "El título es obligatorio"}
          {...register("title", { required: true })}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            {...register("description")}
          />
        </div>

        <InputWithLabel
          id="dueDate"
          label="Fecha de entrega"
          type="datetime-local"
          error={errors.dueDate && "La fecha de entrega es obligatoria"}
          {...register("dueDate", { required: true })}
        />

        <InputWithLabel
          id="reminderDate"
          label="Fecha de recordatorio"
          type="datetime-local"
          {...register("reminderDate")}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Prioridad
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("priority", { required: true })}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Materia
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("subjectId", { 
              required: "Debes seleccionar una materia",
              validate: value => subjects.some(s => s.id === value) || "Materia no válida"
            })}
            value={watch('subjectId') || ''}
          >
            <option value="">Selecciona una materia</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name} - {subject.professor}
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="text-red-500 text-sm mt-1">{errors.subjectId.message}</p>
          )}
        </div>

        <InputWithLabel
          id="estimatedTime"
          label="Tiempo estimado (minutos)"
          type="number"
          {...register("estimatedTime", { min: 0 })}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Adjuntos</label>
          <label htmlFor="attachments" className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-300 rounded-md cursor-pointer hover:bg-blue-100 transition-colors">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.07-7.07a4 4 0 00-5.656-5.657l-7.071 7.07a6 6 0 108.485 8.486L19 13" /></svg>
            <span className="text-blue-700">Seleccionar archivos</span>
            <input id="attachments" type="file" multiple onChange={handleAttachmentChange} className="hidden" />
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {attachments.map((name, idx) => (
              <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center">
                {name}
                <button type="button" onClick={() => removeAttachment(name)} className="ml-1 text-red-500">x</button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (initialData && initialData.id ? 'Editando...' : 'Creando...') : (initialData && initialData.id ? 'Editar Tarea' : 'Crear Tarea')}
        </button>
      </form>
    </motion.div>
  );
}

export default TaskForm;
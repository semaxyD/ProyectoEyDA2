import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Minus, CheckCircle2, Circle } from 'lucide-react';

function SubtaskTree({ task, onUpdate, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [newStep, setNewStep] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtaskName.trim()) return;

    const updatedTask = {
      ...task,
      subtareas: [
        ...(task.subtareas || []),
        {
          nombre: newSubtaskName.trim(),
          pasos: [],
          completada: false
        }
      ]
    };

    onUpdate(updatedTask);
    setNewSubtaskName('');
    setIsAddingSubtask(false);
  };

  const handleAddStep = (subtaskIndex) => {
    if (!newStep.trim()) return;

    const updatedTask = {
      ...task,
      subtareas: task.subtareas.map((subtask, index) => {
        if (index === subtaskIndex) {
          return {
            ...subtask,
            pasos: [...(subtask.pasos || []), newStep.trim()]
          };
        }
        return subtask;
      })
    };

    onUpdate(updatedTask);
    setNewStep('');
  };

  const handleToggleSubtask = (subtaskIndex) => {
    const updatedTask = {
      ...task,
      subtareas: task.subtareas.map((subtask, index) => {
        if (index === subtaskIndex) {
          return {
            ...subtask,
            completada: !subtask.completada
          };
        }
        return subtask;
      })
    };

    onUpdate(updatedTask);
  };

  const handleToggleStep = (subtaskIndex, stepIndex) => {
    const updatedTask = {
      ...task,
      subtareas: task.subtareas.map((subtask, index) => {
        if (index === subtaskIndex) {
          const updatedPasos = [...subtask.pasos];
          updatedPasos[stepIndex] = {
            ...updatedPasos[stepIndex],
            completado: !updatedPasos[stepIndex].completado
          };
          return {
            ...subtask,
            pasos: updatedPasos
          };
        }
        return subtask;
      })
    };

    onUpdate(updatedTask);
  };

  return (
    <div className={`ml-${level * 4} border-l-2 border-gray-200 pl-4`}>
      <div className="flex items-center gap-2 py-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
        <span className="font-medium">{task.nombre}</span>
        <button
          onClick={() => setIsAddingSubtask(true)}
          className="ml-auto text-blue-600 hover:text-blue-800"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {isAddingSubtask && (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  placeholder="Nombre de la subtarea"
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Agregar
                </button>
                <button
                  onClick={() => setIsAddingSubtask(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            )}

            {task.subtareas?.map((subtask, index) => (
              <div key={index} className="ml-4">
                <div className="flex items-center gap-2 py-1">
                  <button
                    onClick={() => handleToggleSubtask(index)}
                    className="text-gray-500 hover:text-blue-500"
                  >
                    {subtask.completada ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <span className={subtask.completada ? 'line-through text-gray-500' : ''}>
                    {subtask.nombre}
                  </span>
                  <button
                    onClick={() => {
                      const input = prompt('Nuevo paso:');
                      if (input) handleAddStep(index);
                    }}
                    className="ml-auto text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="ml-6 space-y-1">
                  {subtask.pasos?.map((paso, pasoIndex) => (
                    <div key={pasoIndex} className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStep(index, pasoIndex)}
                        className="text-gray-500 hover:text-blue-500"
                      >
                        {paso.completado ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <span className={paso.completado ? 'line-through text-gray-500' : ''}>
                        {paso}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SubtaskTree; 
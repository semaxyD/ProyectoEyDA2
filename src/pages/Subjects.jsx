import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Pencil, Trash2, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
} from 'firebase/firestore';

function prepareSubjectForModal(subject) {
  if (!subject) return null;

  let gradeStructure = {};
  try {
    gradeStructure =
      typeof subject.gradeStructure === 'string'
        ? JSON.parse(subject.gradeStructure)
        : subject.gradeStructure || {};
  } catch {
    gradeStructure = {};
  }

  return {
    id: subject.id,
    name: subject.name || '',
    professor: subject.professor || '',
    schedule: subject.schedule || '',
    credits: subject.credits ? subject.credits.toString() : '',
    gradeStructure: {
      firstCut: Number(gradeStructure.firstCut) || 25,
      secondCut: Number(gradeStructure.secondCut) || 25,
      thirdCut: Number(gradeStructure.thirdCut) || 25,
      finalExam: Number(gradeStructure.finalExam) || 25,
    },
    createdAt: subject.createdAt || null,
  };
}

export default function Subjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const subjectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las materias.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const handleDelete = async (subjectId) => {
    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
      toast({
        title: 'Materia eliminada',
        description: 'La materia ha sido eliminada exitosamente.',
      });
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la materia.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (subject) => {
    const preparedSubject = prepareSubjectForModal(subject);
    setSelectedSubject(preparedSubject);
    setIsModalOpen(true);
    setAction('edit');
  };

  const handleOpenChat = (subject) => {
    toast({
      title: 'Próximamente',
      description: 'El chat de la materia estará disponible pronto.',
    });
  };

  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    professor: '',
    schedule: '',
    credits: '',
    gradeStructure: {
      firstCut: 25,
      secondCut: 25,
      thirdCut: 25,
      finalExam: 25,
    },
  });

  useEffect(() => {
    if (selectedSubject && isModalOpen) {
      setFormData({
        name: selectedSubject.name,
        professor: selectedSubject.professor,
        schedule: selectedSubject.schedule,
        credits: selectedSubject.credits,
        gradeStructure: {
          firstCut: selectedSubject.gradeStructure.firstCut,
          secondCut: selectedSubject.gradeStructure.secondCut,
          thirdCut: selectedSubject.gradeStructure.thirdCut,
          finalExam: selectedSubject.gradeStructure.finalExam,
        },
      });
    } else if (isModalOpen) {
      setFormData({
        name: '',
        professor: '',
        schedule: '',
        credits: '',
        gradeStructure: {
          firstCut: 25,
          secondCut: 25,
          thirdCut: 25,
          finalExam: 25,
        },
      });
    }
  }, [selectedSubject, isModalOpen]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSubject(null);
    setAction(null);
    setModalLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstCut, secondCut, thirdCut, finalExam } = formData.gradeStructure;
    const total = firstCut + secondCut + thirdCut + finalExam;
    const creditsNumber = Number(formData.credits);

    if (total !== 100) {
      return toast({
        title: 'Error de estructura',
        description: 'La suma de los cortes debe ser exactamente 100%.',
        variant: 'destructive',
      });
    }

    if (
      [firstCut, secondCut, thirdCut, finalExam].some(
        (cut) => isNaN(cut) || cut < 0 || cut > 100
      ) ||
      isNaN(creditsNumber) ||
      creditsNumber <= 0
    ) {
      return toast({
        title: 'Datos inválidos',
        description:
          'Verifica que todos los cortes estén entre 0 y 100 y que los créditos sean válidos.',
        variant: 'destructive',
      });
    }

    setModalLoading(true);

    try {
      const subjectData = {
        ...formData,
        userId: user.uid,
        createdAt: selectedSubject ? selectedSubject.createdAt : new Date(),
        updatedAt: new Date(),
        name: formData.name.trim(),
        professor: formData.professor.trim(),
        schedule: formData.schedule.trim(),
        gradeStructure: JSON.stringify(formData.gradeStructure),
      };

      if (selectedSubject) {
        const subjectRef = doc(db, 'subjects', selectedSubject.id);
        await updateDoc(subjectRef, subjectData);
      } else {
        await addDoc(collection(db, 'subjects'), subjectData);
      }

      toast({
        title: action === 'edit' ? 'Materia actualizada' : 'Materia creada',
        description: `La materia "${formData.name}" fue ${
          action === 'edit' ? 'actualizada' : 'creada'
        } con éxito.`,
      });

      fetchSubjects();
      handleModalClose();
    } catch (error) {
      console.error(error);
      let message = 'Hubo un error al procesar tu solicitud.';

      if (error.code === 'unavailable') {
        message = 'Parece que estás sin conexión a internet.';
      } else if (error.code === 'permission-denied') {
        message = 'No tienes permisos para esta acción.';
      } else if (error.message?.toLowerCase().includes('network')) {
        message = 'Error de red. Verifica tu conexión.';
      }

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const cutLabels = {
    firstCut: 'Primer Corte',
    secondCut: 'Segundo Corte',
    thirdCut: 'Tercer Corte',
    finalExam: 'Examen Final',
  };

  const gradeCuts = ['firstCut', 'secondCut', 'thirdCut', 'finalExam'];

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-violet-50 p-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold gradient-text">Gestión de Materias</h1>
        <Button
          onClick={() => {
            setSelectedSubject(null);
            setAction("create");
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-[#284dcb] to-[#4168e3]"
        >
          <PlusCircle className="mr-2 h-4 w-4 text-white" />
          <p className="text-white">Nueva Materia</p>
        </Button>
      </div>

      {loading ? (
        <div className="col-span-full text-center py-12 glass-card rounded-xl flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#284dcb]" />
          <p className="text-gray-500">Cargando materias...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="col-span-full text-center py-12 glass-card rounded-xl">
          <p className="text-gray-500">No hay materias registradas</p>
          <Button
            onClick={() => {
              setSelectedSubject(null);
              setAction("create");
              setIsModalOpen(true);
            }}
            className="mt-4 bg-gradient-to-r from-[#284dcb] to-[#4168e3]"
          >
            <PlusCircle className="mr-2 h-4 w-4 text-white" />
            <p className="text-white">Agregar tu primera materia</p>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-blue-100 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-blue-700 mb-1">{subject.name}</h3>
                  <p className="text-sm text-gray-500 italic mb-1">{subject.professor}</p>
                  <p className="text-xs text-blue-400 font-medium mb-2">{subject.schedule}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenChat(subject)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Chat materia"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSubject(subject);
                      setAction("edit");
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                    title="Editar materia"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSubjectToDelete(subject.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar materia"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">Créditos: {subject.credits}</span>
                  <span className="inline-block bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded-full font-semibold">Horario: {subject.schedule}</span>
                </div>
                <button
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow hover:from-blue-600 hover:to-cyan-600 transition-colors text-sm font-semibold w-fit"
                  onClick={() => navigate('/grades')}
                >
                  Calcular nota final
                </button>
              </div>

              <div className="pt-4 border-t border-blue-100">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-700">Estructura de Notas:</span>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="text-center p-2 rounded bg-blue-50">
                      <div className="font-medium text-blue-600">1° Corte</div>
                      <div className="text-lg font-bold">{subject.gradeStructure?.firstCut}%</div>
                    </div>
                    <div className="text-center p-2 rounded bg-blue-50">
                      <div className="font-medium text-blue-600">2° Corte</div>
                      <div className="text-lg font-bold">{subject.gradeStructure?.secondCut}%</div>
                    </div>
                    <div className="text-center p-2 rounded bg-blue-50">
                      <div className="font-medium text-blue-600">3° Corte</div>
                      <div className="text-lg font-bold">{subject.gradeStructure?.thirdCut}%</div>
                    </div>
                    <div className="text-center p-2 rounded bg-blue-50">
                      <div className="font-medium text-blue-600">Final</div>
                      <div className="text-lg font-bold">{subject.gradeStructure?.finalExam}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal para crear o editar materia */}
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white rounded-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              {action === "edit" ? "Editar Materia" : "Crear Materia"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-medium">
                  Nombre de la materia
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="professor" className="block font-medium">
                  Profesor
                </label>
                <input
                  id="professor"
                  type="text"
                  value={formData.professor}
                  onChange={(e) =>
                    setFormData({ ...formData, professor: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="schedule" className="block font-medium">
                  Horario
                </label>
                <input
                  id="schedule"
                  type="text"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="credits" className="block font-medium">
                  Créditos
                </label>
                <input
                  id="credits"
                  type="number"
                  min={1}
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: e.target.value })
                  }
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <fieldset className="border p-4 rounded">
                <legend className="font-semibold mb-2">Estructura de notas (%)</legend>
                {gradeCuts.map((cut) => (
                  <div key={cut} className="mb-2">
                    <label htmlFor={cut} className="block text-sm font-medium capitalize">
                      {cut}
                    </label>
                    <input
                      id={cut}
                      type="number"
                      min={0}
                      max={100}
                      value={formData.gradeStructure[cut] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gradeStructure: {
                            ...formData.gradeStructure,
                            [cut]: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                ))}
              </fieldset>

              <div className="flex justify-end gap-4 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#284dcb] to-[#4168e3] text-white">
                  {action === "edit" ? "Guardar cambios" : "Crear materia"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal para confirmar eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-xl font-semibold mb-4">¿Eliminar materia?</h2>
            <p className="mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-1/2"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  await handleDelete(subjectToDelete);
                  setIsDeleteModalOpen(false);
                  setSubjectToDelete(null);
                }}
                className="w-1/2"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  </div>
);


}

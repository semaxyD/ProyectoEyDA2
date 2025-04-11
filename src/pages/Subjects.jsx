
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Pencil, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import SubjectModal from '@/components/subjects/SubjectModal';
import { Loader2 } from "lucide-react";


function Subjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const subjectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las materias.',
        variant: 'destructive',
      });
    }finally{
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
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleOpenChat = (subject) => {
    toast({
      title: 'Próximamente',
      description: 'El chat de la materia estará disponible pronto.',
    });
  };

  return (
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
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-[#284dcb] to-[#4168e3]"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Materia
        </Button>
      </div>
  
      {loading ? (
        <div className="col-span-full text-center py-12 glass-card rounded-xl flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#284dcb]" />
          <p className="text-gray-500">Cargando materias...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-xl p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{subject.name}</h3>
                  <p className="text-sm text-gray-600">Prof. {subject.professor}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenChat(subject)}
                    className="text-[#284dcb] hover:text-[#4168e3]"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(subject)}
                    className="text-[#284dcb] hover:text-[#4168e3]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(subject.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
  
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Horario:</span> {subject.schedule}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Créditos:</span> {subject.credits}
                </p>
              </div>
  
              <div className="pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Estructura de Notas:</span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">Primer Corte</div>
                      <div>{subject.gradeStructure?.firstCut}%</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">Segundo Corte</div>
                      <div>{subject.gradeStructure?.secondCut}%</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">Final</div>
                      <div>{subject.gradeStructure?.finalExam}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
  
          {subjects.length === 0 && (
            <div className="col-span-full text-center py-12 glass-card rounded-xl">
              <p className="text-gray-500">No hay materias registradas</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 bg-gradient-to-r from-[#284dcb] to-[#4168e3]"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar tu primera materia
              </Button>
            </div>
          )}
        </div>
      )}
  
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubject(null);
        }}
        subject={selectedSubject}
        onSuccess={fetchSubjects}
      />
    </motion.div>
  );
}

export default Subjects;
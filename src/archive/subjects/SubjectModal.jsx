import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

function SubjectModal({ isOpen, onClose, subject, action, onSuccess }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
    if (subject) {
      // Asumimos que subject ya está limpio, no necesitamos JSON.parse ni nada
      setFormData({
        name: subject.name,
        professor: subject.professor,
        schedule: subject.schedule,
        credits: subject.credits,
        gradeStructure: {
          firstCut: subject.gradeStructure.firstCut,
          secondCut: subject.gradeStructure.secondCut,
          thirdCut: subject.gradeStructure.thirdCut,
          finalExam: subject.gradeStructure.finalExam,
        },
      });
    } else {
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
  }, [subject]);

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
        description: 'Verifica que todos los cortes estén entre 0 y 100 y que los créditos sean válidos.',
        variant: 'destructive',
      });
    }

    setLoading(true);

    try {
      const subjectData = {
        ...formData,
        userId: user.uid,
        createdAt: subject ? subject.createdAt : new Date(),
        updatedAt: new Date(),
        name: formData.name.trim(),
        professor: formData.professor.trim(),
        schedule: formData.schedule.trim(),
        gradeStructure: JSON.stringify(formData.gradeStructure),
      };

      if (subject) {
        const subjectRef = doc(db, 'subjects', subject.id);
        await updateDoc(subjectRef, subjectData);
      } else {
        await addDoc(collection(db, 'subjects'), subjectData);
      }

      toast({
        title: action === 'edit' ? 'Materia actualizada' : 'Materia creada',
        description: `La materia "${formData.name}" fue ${action === 'edit' ? 'actualizada' : 'creada'} con éxito.`,
      });

      onSuccess?.();
      onClose();
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
      setLoading(false);
    }
  };

  const cutLabels = {
    firstCut: 'Primer Corte',
    secondCut: 'Segundo Corte',
    thirdCut: 'Tercer Corte',
    finalExam: 'Examen Final',
  };

  const gradeCuts = ['firstCut', 'secondCut', 'thirdCut', 'finalExam'];

  console.log('gradeCuts:', gradeCuts);
  console.log('cutLabels:', cutLabels);
  console.log('formData:', formData);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{action === 'edit' ? 'Editar Materia' : 'Nueva Materia'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre de la Materia</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="professor">Profesor</Label>
            <Input
              id="professor"
              value={formData.professor}
              onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="schedule">Horario</Label>
            <Input
              id="schedule"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="Ej: Lunes y Miércoles 10:00 AM"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="credits">Créditos</Label>
            <Input
              id="credits"
              type="number"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Estructura de Notas (%)</Label>
            <div className="grid grid-cols-2 gap-2">
              {gradeCuts.map((cut) => (
                <div key={cut}>
                  <Label htmlFor={cut}>{cutLabels[cut]}</Label>
                  <Input
                    id={cut}
                    type="number"
                    value={formData.gradeStructure[cut]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gradeStructure: {
                          ...prev.gradeStructure,
                          [cut]: Number(e.target.value),
                        },
                      }))
                    }
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : action === 'edit' ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SubjectModal;

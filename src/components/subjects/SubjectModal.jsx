
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

function SubjectModal({ isOpen, onClose, subject = null, onSuccess }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: subject?.name || '',
    professor: subject?.professor || '',
    schedule: subject?.schedule || '',
    credits: subject?.credits || '',
    gradeStructure: subject?.gradeStructure || {
        firstCut: 25,
        secondCut: 25,
        thirdCut: 25,
        finalExam: 25,
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstCut, secondCut, thirdCut, finalExam } = formData.gradeStructure;
    const total = firstCut + secondCut + thirdCut + finalExam;

    if (total !== 100) {
        toast({
          title: 'Error de estructura',
          description: 'La suma de los porcentajes de los cortes debe ser exactamente 100%.',
          variant: 'destructive',
        });
        return;
    }

    const cuts = [firstCut, secondCut, thirdCut, finalExam];
    const cutsInvalid = cuts.some(
        (cut) => isNaN(cut) || cut < 0 || cut > 100
    );
    const creditsNumber = Number(formData.credits);

    if (cutsInvalid || isNaN(creditsNumber) || creditsNumber <= 0) {
        toast({
            title: 'Error en los datos',
            description:
            'Asegúrate de que los cortes estén entre 0 y 100 y los créditos sean mayores a 0.',
            variant: 'destructive',
        });
        return;
    }

    setLoading(true);
    
    try {
      const subjectData = {
        ...formData,
        userId: user.uid,
        createdAt: subject ? subject.createdAt : new Date(),
        updatedAt: new Date(),
      };

      subjectData.name = subjectData.name.trim();
      subjectData.professor = subjectData.professor.trim();
      subjectData.schedule = subjectData.schedule.trim();

      if (subject) {
        // Update existing subject
        const subjectRef = doc(db, 'subjects', subject.id);
        await updateDoc(subjectRef, {
          ...subjectData,
          updatedAt: new Date(),
        });
      } else {
        // Create new subject
        await addDoc(collection(db, 'subjects'), subjectData);
      }

      toast({
        title: subject ? 'Materia actualizada' : 'Materia creada',
        description: `La materia ${formData.name} ha sido ${subject ? 'actualizada' : 'creada'} exitosamente.`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      
      let message = 'Hubo un error al procesar tu solicitud.';
      
      if (error.code === 'unavailable') {
        message = 'Parece que estás sin conexión a internet.';
      }else if (error.code === 'permission-denied') {
        message = 'No tienes permisos para realizar esta acción.';
      }else if (error.message.includes('network') || error.message.includes('Network')) {
        message = 'Error de red. Revisa tu conexión a internet.';
      }

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }finally{
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{subject ? 'Editar Materia' : 'Nueva Materia'}</DialogTitle>
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
  
          {/* Estructura de notas editable */}
          <div className="grid gap-2">
            <Label>Estructura de notas (%)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="firstCut">Primer corte</Label>
                <Input
                  id="firstCut"
                  type="number"
                  value={formData.gradeStructure.firstCut}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gradeStructure: {
                        ...prev.gradeStructure,
                        firstCut: Number(e.target.value),
                      },
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="secondCut">Segundo corte</Label>
                <Input
                  id="secondCut"
                  type="number"
                  value={formData.gradeStructure.secondCut}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gradeStructure: {
                        ...prev.gradeStructure,
                        secondCut: Number(e.target.value),
                      },
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="thirdCut">Tercer corte</Label>
                <Input
                  id="thirdCut"
                  type="number"
                  value={formData.gradeStructure.thirdCut}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gradeStructure: {
                        ...prev.gradeStructure,
                        thirdCut: Number(e.target.value),
                      },
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="finalExam">Examen Final</Label>
                <Input
                  id="finalExam"
                  type="number"
                  value={formData.gradeStructure.finalExam}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gradeStructure: {
                        ...prev.gradeStructure,
                        finalExam: Number(e.target.value),
                      },
                    }))
                  }
                  required
                />
              </div>
            </div>
          </div>
  
          <DialogFooter>
            <Button type="submit" className="bg-gradient-to-r from-[#284dcb] to-[#4168e3]" disabled={loading}>
              {loading ? 'Guardando...' : subject ? 'Actualizar' : 'Crear'} Materia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SubjectModal;

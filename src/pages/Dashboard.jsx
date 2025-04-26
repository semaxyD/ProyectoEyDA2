
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, BookOpen, CheckSquare} from 'lucide-react';

function Dashboard() {
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-violet-50 p-6 ">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.h1 
          variants={item}
          className="text-4xl font-bold gradient-text"
        >
          Bienvenido a tu DashBoard 😉
        </motion.h1>

        <motion.div 
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="glass-card rounded-2xl p-6 transform transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#284dcb]/10">
                <BookOpen className="h-6 w-6 text-[#284dcb]" />
              </div>
              <h2 className="text-xl font-semibold">Resumen de Materias</h2>
            </div>
            <div className="space-y-4">
              <p className="text-[#585858]">No hay materias registradas</p>
              <Button
                onClick={() => {
                  toast({
                    title: "Próximamente",
                    description: "Esta función estará disponible pronto",
                  });
                }}
                className="w-full bg-gradient-to-r from-[#284dcb] to-[#4168e3] hover:opacity-90 transition-opacity"
              >
                <PlusCircle className="mr-2 h-4 w-4 text-white" />
                <p className='text-white'>Agregar Materia</p>
              </Button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 transform transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#284dcb]/10">
                <CheckSquare className="h-6 w-6 text-[#284dcb]" />
              </div>
              <h2 className="text-xl font-semibold">Tareas Pendientes</h2>
            </div>
            <div className="space-y-4">
              <p className="text-[#585858]">No hay tareas pendientes</p>
              <Button
                onClick={() => {
                  toast({
                    title: "Próximamente",
                    description: "Esta función estará disponible pronto",
                  });
                }}
                className="w-full bg-gradient-to-r from-[#284dcb] to-[#4168e3] hover:opacity-90 transition-opacity"
              >
                <PlusCircle className="mr-2 h-4 w-4 text-white" />
                <p className='text-white'>Agregar Tarea</p>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Dashboard;

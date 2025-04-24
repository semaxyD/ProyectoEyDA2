
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, BookOpen, CheckSquare, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { toast } = useToast();
  const  navigate = useNavigate();

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

  const handleLogout = async () =>{
    try{
      await signOut(auth);
      navigate('/');
    }catch(error){
      toast({
        title: 'Error',
        description: `Hubo un error al cerrar sesión: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
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
        className='text-right'
      >
        <Button
          onClick={handleLogout}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          <LogOut className="mr-2 h-5 w-5"/>
          Cerrar sesión
        </Button>
      </motion.div>

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
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Materia
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
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Tarea
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;

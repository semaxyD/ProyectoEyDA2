import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

function Tasks(){
    return (
        <motion.div
            initial={{opacity: 0,y:20 }}
            animate={{opacity: 1,y:0}}
            trasition={{duration: 0.5}}
            className="space-y-6"
        >
            <h1 className='text-3xl font-bold gradient-text'>Gestión de Tareas</h1>
            <div className='glass-card rounded-xl p-8 flex flex-col items-center justify-center gap-4'>
                <Construction className='h-10 w-10 text-[#284dcb]' />
                <p className='text-lg text-center text-gray-600'>
                    Esta sección está en contrucción. Muy pronto podrás gestionar tus tareas desde aquí.
                </p>
            </div>
        </motion.div>
    );
};

export default Tasks;
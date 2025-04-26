import React from 'react';
import { motion } from 'framer-motion';

function Grades() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-violet-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-[#284dcb] mb-6">
          Cálculo de Notas
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-[#585858]">Próximamente: Cálculo de notas</p>
        </div>
      </motion.div>
    </div>
  );
}

export default Grades;

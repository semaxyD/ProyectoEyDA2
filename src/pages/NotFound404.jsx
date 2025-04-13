import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'frame-motion';

function NotFound404 (){
    return(
        <div className='flex items-center justify-center h-screen bg-gray-100'>
            <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <h1 className='text-6xl font-bold text-[#284dcb] mb-4'>404</h1>
                <p className='text-xl text-gray 600 mb-6'>Oops... Página no encontrada</p>
                <Link
                    to="/"
                    className='px-6 py-2 bg-gradient-to-r from-[#284dcb] to-[#4168e3] text-white rounded-md hover:bg-blue-700'
                >
                    Volver al inicio
                </Link>
            </motion.div>
        </div>
    );
}

export default NotFound404;
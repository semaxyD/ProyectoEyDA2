import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import InputWithLabel from '../components/ui/inputWithLabel'; 

function Login() {
  const navigate = useNavigate();
  const [firebaseError, setFirebaseError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleLoginWithEmail = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setFirebaseError("Error de autenticación: " + err.message);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      setFirebaseError("Error de autenticación: " + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold text-[#284dcb] mb-2">UTrackTask</h1>
        <p className="text-sm text-gray-600 mb-6 italic">Organiza tu día, alcanza tus metas.</p>

        <h2 className="text-2xl font-semibold text-[#284dcb] mb-6">
          Iniciar sesión
        </h2>

        {firebaseError && <p className="text-red-500 text-sm mb-4">{firebaseError}</p>}

        <form onSubmit={handleSubmit(handleLoginWithEmail)} noValidate>
          <InputWithLabel
            id="email"
            label="Correo electrónico"
            type="email"
            error={errors.email && "El correo es obligatorio"}
            {...register("email", { required: true })}
          />
          <InputWithLabel
            id="password"
            label="Contraseña"
            type="password"
            error={errors.password && "La contraseña es obligatoria"}
            {...register("password", { required: true })}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-gradient-to-r from-[#284dcb] to-[#4168e3] text-white rounded-md hover:scale-105 transition-transform"
          >
            {isSubmitting ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow" />
          <span className="mx-4 text-gray-600">o</span>
          <hr className="flex-grow" />
        </div>

        <button
          onClick={handleLoginWithGoogle}
          className="w-full py-2 bg-gray-200 text-gray-800 rounded-md flex items-center justify-center gap-2 hover:bg-gray-300"
        >
          <FcGoogle className="text-2xl" />
          <span className="text-base font-medium">Iniciar sesión con Google</span>
        </button>

        <p className="text-sm mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-[#284dcb] hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;

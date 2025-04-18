import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email: user.email,
        photoURL: '',
        role: 'user',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        settings: {
          notifications: 'enabled',
          theme: 'light'
        }
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Error al registrar: ' + err.message);
    }
  };

  const handleRegisterWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'user',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          settings: {
            notifications: 'enabled',
            theme: 'light'
          }
        });
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Error con Google: ' + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-[#284dcb] mb-6">Crear cuenta</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Nombre</label>
            <input
              type="text"
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">Correo</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-[#284dcb] to-[#4168e3] text-white rounded-md hover:scale-105 transition-transform"
          >
            Registrarse
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow" />
          <span className="mx-4 text-gray-600">o</span>
          <hr className="flex-grow" />
        </div>

        <button
          onClick={handleRegisterWithGoogle}
          className="w-full py-2 bg-gray-200 text-gray-800 rounded-md flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
        >
          <FcGoogle className="text-2xl" />
          <span className="text-base font-medium">Registrarse con Google</span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">¿Ya tienes una cuenta?</p>
          <button
            onClick={() => navigate('/')}
            className="text-[#284dcb] font-medium hover:underline mt-1"
          >
            Volver al login
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;

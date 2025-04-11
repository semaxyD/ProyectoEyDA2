import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase'; 
import { useNavigate } from 'react-router-dom'; 

function Login(){
    const [email, setEmail]=useState('');
    const [password, setPassword]=useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading]=useState(false)
    const navigate = useNavigate();

    const handleLoginWithEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate('/dashboard'); // Redirigir al dashboard después de login
        } catch (err) {
          setError("Error de autenticación: " + err.message);
        }finally{
            setLoading(false);
        }
      };
    
      // Función para manejar el login con Google
      const handleLoginWithGoogle = async () => {
        try {
          await signInWithPopup(auth, googleProvider);
          navigate('/dashboard'); // Redirigir al dashboard después de login
        } catch (err) {
          setError("Error de autenticación: " + err.message);
        }
      };
    
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-center text-[#284dcb] mb-6">
              Iniciar sesión
            </h2>
    
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
    
            {/* Formulario de login con correo y contraseña */}
            <form onSubmit={handleLoginWithEmail}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-600">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                  placeholder="tu@email.com"
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
                disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-[#284dcb] to-[#4168e3] text-white rounded-md hover:bg-blue-700"
              >
                {loading ? 'Cargando...':'Iniciar sesión' }
              </button>
            </form>
    
            {/* Opción para login con Google */}
            <div className="flex items-center my-4">
              <hr className="flex-grow" />
              <span className="mx-4 text-gray-600">o</span>
              <hr className="flex-grow" />
            </div>
    
            <button
              onClick={handleLoginWithGoogle}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded-md flex items-center justify-center gap-2 hover:bg-gray-300"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" className="w-5 h-5" />
              Iniciar sesión con Google
            </button>
          </div>
        </div>
      );
}

export default Login;

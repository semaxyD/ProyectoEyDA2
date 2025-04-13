import React, {useState} from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../lib/firebase';
import { doc, setDoc, serverTimeStamp, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Register(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) =>{
        e.preventDefault();
        setError(null);
        try{
            const result = await createUserWithEmailAndPassword(auth,email,password);
            const user = result.user;
            console.log("Usuario registrado:", user);
            
            // Guardar info personal de los users en Firestore
            await setDoc(doc(db, 'users',user.uid),{
                displayName,
                email: user.email,
                photoURL: '',
                role: 'user',
                createdAt: serverTimeStamp(),
                lastLogin: serverTimeStamp(),
                settings: {
                    notifications: 'enabled',
                    theme: 'light'
                }
            });

            navigate('/dashboard')
        }catch(err){
            setError('Error al registrar: '+ err.message);
        }
    };

    const handleRegisterWithGoogle = async () => {
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            console.log("Usuario registrado con Google:", user);

            const userDoc = await getDoc(doc(db, 'users',user.uid));
            if(!userDoc.exists()){
                // Si es nuevo, creamos el documento
                await setDoc(doc(db,'users', user.uid),{
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: 'user',
                    createdAt: serverTimeStamp(),
                    lastLogin: serverTimeStamp(),
                    settings: {
                        notifications: 'enabled',
                        theme: 'light'
                    }
                });
            }

            navigate('/dashboard');

        } catch(err){
            setError('Error con Google: '+ err.message);
        }
    };
    return(
        <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-[#284dcb] mb-6">Registrarse</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Registro con correo */}
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
            className="w-full py-2 bg-gradient-to-r from-[#284dcb] to-[#4168e3] text-white rounded-md hover:bg-blue-700"
          >
            Registrarse
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center my-4">
          <hr className="flex-grow" />
          <span className="mx-4 text-gray-600">o</span>
          <hr className="flex-grow" />
        </div>

        {/* Google */}
        <button
          onClick={handleRegisterWithGoogle}
          className="w-full py-2 bg-gray-200 text-gray-800 rounded-md flex items-center justify-center gap-2 hover:bg-gray-300"
        >
          <img
            src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
            alt="Google Logo"
            className="w-5 h-5"
          />
          Registrarse con Google
        </button>
      </div>
    </div>
    );
}

export default Register;
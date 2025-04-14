import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [userLoggedIn, setUserLoggedIn] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserLoggedIn(user);
            setLoading(false);
        });
        return() => unsubscribe();
    }, []);

    if(loading){
        return <div className="text-center mt-20">Cargando...</div>
    }

    if(!userLoggedIn){
        return <Navigate to="/" />;
    }

    return children;
}

import React from "react";
import { Routes, Route } from 'react-router-dom';
import {ProtectedRoute} from '../components/ProtectedRoute'

// Importar tus páginas
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Subjects from '../pages/Subjects';
import Tasks from '../pages/Tasks';
import Grades from '../pages/Grades';
import NotFound404 from '../pages/NotFound404';

const AppRoutes = () =>{
    return(
        <Routes>
            {/* Rutas publicas */}
            <Route path="/" element={<Login />}/>
            <Route path="/register" element={<Register/>}/>

            {/* Rutas protegidas */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <Dashboard/>
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/subjects" 
                element={
                    <ProtectedRoute>
                        <Subjects/>
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/tasks"
                element={
                    <ProtectedRoute>
                        <Tasks/>
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/grades" 
                element={
                    <ProtectedRoute>
                        <Grades/>
                    </ProtectedRoute>
                }
            />

            {/* Ruta no encontrada */}
            <Route path="*" element={<NotFound404/>}/>            
        </Routes>
    );
};

export default AppRoutes;


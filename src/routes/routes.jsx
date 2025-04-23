import React from "react";
import { Routes, Route } from 'react-router-dom';
import {ProtectedRoute} from '../components/ProtectedRoute'

import Layout from '../components/Layouts'

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
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/grades" element={<Grades />} />
            </Route>

            {/* Ruta no encontrada */}
            <Route path="*" element={<NotFound404/>}/>            
        </Routes>
    );
};

export default AppRoutes;


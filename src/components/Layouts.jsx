import React from "react";
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckSquare, GraduationCap, Home, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Outlet } from "react-router-dom";

const navItems = [
    {path: '/',icon: Home, label: 'Dashboard'},
    {path: '/subjects',icon: BookOpen, label: 'Materias'},
    {path: '/tasks',icon: CheckSquare, label: 'Tareas'},
    {path: '/grades',icon: GraduationCap, label: 'Notas'},
];

function Layout(){
    const location = useLocation();
    const { user, login, logout } = useAuth() ?? {};

    return (
        <div className="min-h-screen">
            <nav className="fixed bottom-0 left-0 right-0 glass-nav md:top-0 md:bottom-auto z-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="hidden md:flex items-center gap-2">
                            <img src="/logoApp.svg" alt="Logo" className="w-8 h-8"/>
                            <span className="text-xl font-bold text-[#284dcb] mb-2">UTrackTask</span>
                        </div>

                        <div className="flex justify-center intems-center gap-6 flex-1 md:flex-none md:justify-center">
                            {navItems.map(({path, icon: Icon, label}) =>(
                                <Link
                                    key={path}
                                    to={path}
                                    className={`relative flex flex-col items-center justify-center text-sm group ${
                                        location.pathname === path ? 'text-[#284dcb]' : 'text-[#585858]'
                                        }`}
                                >
                                    <span className="absolute -inset-4 rounded-xl bg-[#284dcb]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Icon className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:scale-110" />
                                    <span className="mt-1 text-[10px] md:text-xs">{label}</span>
                                    {location.pathname === path && (
                                        <motion.div
                                            LayoutId="activeTab"
                                            className="absolute bottom-0 h-1 w-8 bg-gradient-to-r from-[#284dcb] to-[#4168e3] rounded-full"
                                            initial={false}
                                            transition={{ type: "string", stiffness: 500, damping: 30}}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback> 
                                    </Avatar>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={logout}
                                        className="text-[#585858] hover:text-[#284dcb]"
                                    >
                                        <LogOut className="h-5 w-5"/>
                                    </Button>
                                </>
                            ):(
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={login}
                                    className="text-[#585858] hover:text-[#284dcb]"
                                >
                                    <LogIn className="h-5 w-5 mr-2" />
                                    Iniciar Sesión
                                </Button>
                            )}
                        </div>

                        {/* Mobile Login Button */}
                        <div className="md:hidden absolute right-4 top-4">
                            {user ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logout}
                                    className="text-[#585858]"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={login}
                                    className="text-[#585858]"
                                >
                                    <LogIn className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 pt-6 pb-20 md:pt-20 md:pb-6">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
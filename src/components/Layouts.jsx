import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, CheckSquare, GraduationCap, Home, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Outlet } from "react-router-dom";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Dashboard" },
  { path: "/subjects", icon: BookOpen, label: "Materias" },
  { path: "/tasks", icon: CheckSquare, label: "Tareas" },
  { path: "/grades", icon: GraduationCap, label: "Notas" },
];

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth() ?? {};
  const [open, setOpen] = useState(false); // Estado para el modal de confirmación
  const { toast } = useToast();

  const handleConfirmLogout = async () => {
    try {
      await signOut(auth); // Cerrar sesión
      navigate("/"); // Redirigir al inicio
    } catch (error) {
      toast({
        title: "Error",
        description: `Hubo un error al cerrar sesión: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50 bg-white/80 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="hidden md:flex items-center gap-2">
              <img src="/logoApp.svg" alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-[#284dcb] mb-2">UTrackTask</span>
            </div>

            {/* Nav Items */}
            <div className="flex justify-center items-center gap-6 flex-1 md:flex-none md:justify-center">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex flex-col items-center justify-center text-sm group ${
                    location.pathname === path ? "text-[#284dcb]" : "text-[#585858]"
                  }`}
                >
                  <span className="absolute -inset-4 rounded-xl bg-[#284dcb]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:scale-110" />
                  <span className="mt-1 h-0 text-[10px] md:text-xs">{label}</span>
                  {location.pathname === path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 h-1 w-8 bg-gradient-to-r from-[#284dcb] to-[#4168e3] rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop user section */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Avatar className="h-10 w-10 flex items-center justify-center">
                  {user?.photoURL ? (
                        <AvatarImage src={user.photoURL} />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-300 via-blue-200 to-pink-200 text-gray-800 flex items-center justify-center font-semibold text-lg uppercase">
                        <span className="flex items-center justify-center w-full h-full">{user?.email?.charAt(0)}</span>
                        </div>
                    )}
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => setOpen(true)}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Cerrar sesión
                  </Button>
                </>
              ) : (
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

            {/* Mobile logout/login */}
            <div className="md:hidden flex right-4 top-4">
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#585858]"
                  onClick={() => setOpen(true)}
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

      {/* Confirmación de Logout - Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-xl font-semibold mb-4">¿Estás seguro?</h2>
            <p className="mb-4">Esta acción cerrará tu sesión.</p>
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="w-1/2"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmLogout}
                className="w-1/2"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;

"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Mail, 
  Lock, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  Loader2
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Framer Motion variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");
    setIsSuccess(false);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
      } else if (result?.ok) {
        setIsSuccess(true);
        // Pequeño delay para mostrar el estado de éxito
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 800);
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.");
    } finally {
      if (!isSuccess) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Login Card */}
      <motion.div
        className="w-full max-w-md relative z-10"
        {...fadeInUp}
      >
        <Card className="backdrop-blur-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          <motion.div 
            className="p-8 space-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Logo and Title */}
            <motion.div 
              className="text-center space-y-4"
              variants={fadeInUp}
            >
              <div className="flex items-center justify-center">
                <motion.div 
                  className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Zap className="h-9 w-9 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ClientPro CRM
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Inicia sesión para continuar
                </p>
              </div>
            </motion.div>

            {/* Success Message */}
            {isSuccess && (
              <motion.div 
                className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded-r-lg flex items-start gap-3"
                {...scaleIn}
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  ¡Inicio de sesión exitoso! Redirigiendo...
                </p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div 
                className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3"
                {...scaleIn}
              >
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <motion.form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-5"
              variants={fadeInUp}
            >
              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
                >
                  <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Correo electrónico
                </Label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="h-12 text-base transition-all duration-200 focus:shadow-lg focus:shadow-blue-500/20"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                </motion.div>
                {errors.email && (
                  <motion.p 
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    {...scaleIn}
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor="password" 
                    className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Contraseña
                  </Label>
                  <motion.a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </motion.a>
                </div>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 text-base transition-all duration-200 focus:shadow-lg focus:shadow-blue-500/20"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                  />
                </motion.div>
                {errors.password && (
                  <motion.p 
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    {...scaleIn}
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </span>
                  ) : isSuccess ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      ¡Éxito!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Iniciar sesión
                    </span>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Divider */}
            <motion.div className="relative" variants={fadeInUp}>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/90 dark:bg-slate-900/90 px-2 text-slate-500 dark:text-slate-400 font-medium">
                  Usuarios de prueba
                </span>
              </div>
            </motion.div>

            {/* Test Users */}
            <motion.div 
              className="bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800/50 dark:to-purple-900/20 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
              variants={fadeInUp}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">ADMIN</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                      admin@clientpro.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">MANAGER</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                      manager@clientpro.com
                    </p>
                  </div>
                </div>
                <div className="pl-11 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Contraseña:</span> Password123!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.p 
              className="text-center text-xs text-slate-500 dark:text-slate-400"
              variants={fadeInUp}
            >
              © 2026 ClientPro CRM. Todos los derechos reservados.
            </motion.p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}

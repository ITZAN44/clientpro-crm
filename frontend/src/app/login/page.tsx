'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Zap, Mail, Lock, AlertCircle, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { fadeInUp, fadeIn, scaleIn, staggerContainer, TRANSITION_BASE } from '@/lib/motion';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    setIsSuccess(false);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas');
      } else if (result?.ok) {
        setIsSuccess(true);
        // Pequeño delay para mostrar el estado de éxito
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 800);
      }
    } catch (err) {
      setError('Ocurrió un error. Intenta nuevamente.');
    } finally {
      if (!isSuccess) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Login Card */}
      <motion.div
        className="w-full max-w-md relative z-10"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-card border border-border shadow-2xl shadow-black/50">
          <motion.div
            className="p-8 space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Logo and Title */}
            <motion.div className="text-center space-y-4" variants={fadeInUp}>
              <div className="flex items-center justify-center">
                <motion.div
                  className="h-16 w-16 border border-primary/40 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Zap className="h-9 w-9" strokeWidth={2.5} />
                </motion.div>
              </div>

              <div>
                <h1 className="text-4xl font-bold font-serif text-foreground">ClientPro CRM</h1>
                <p className="text-muted-foreground mt-2">Inicia sesión para continuar</p>
              </div>
            </motion.div>

            {/* Success Message */}
            {isSuccess && (
              <motion.div
                className="p-4 bg-success/10 border-l-4 border-success rounded-r-lg flex items-start gap-3"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
              >
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success font-medium">
                  ¡Inicio de sesión exitoso! Redirigiendo...
                </p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-lg flex items-start gap-3"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
              >
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive font-medium">{error}</p>
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
                  className="text-muted-foreground font-medium flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Correo electrónico
                </Label>
                <motion.div whileFocus={{ scale: 1.01 }} transition={TRANSITION_BASE}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="h-12 text-base bg-input border-border text-foreground transition-all duration-200 focus:shadow-lg focus:shadow-primary/10"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                </motion.div>
                {errors.email && (
                  <motion.p
                    className="text-sm text-destructive flex items-center gap-1"
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
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
                    className="text-muted-foreground font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Contraseña
                  </Label>
                  <motion.a
                    href="#"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </motion.a>
                </div>
                <motion.div whileFocus={{ scale: 1.01 }} transition={TRANSITION_BASE}>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 text-base bg-input border-border text-foreground transition-all duration-200 focus:shadow-lg focus:shadow-primary/10"
                    {...register('password')}
                    aria-invalid={!!errors.password}
                  />
                </motion.div>
                {errors.password && (
                  <motion.p
                    className="text-sm text-destructive flex items-center gap-1"
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300"
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
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">
                  Usuarios de prueba
                </span>
              </div>
            </motion.div>

            {/* Test Users */}
            <motion.div
              className="bg-muted/50 border border-border rounded-lg p-4"
              variants={fadeInUp}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground mb-1">ADMIN</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      admin@clientpro.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground mb-1">MANAGER</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      manager@clientpro.com
                    </p>
                  </div>
                </div>
                <div className="pl-11 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Contraseña:</span> Password123!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.p className="text-center text-xs text-muted-foreground" variants={fadeInUp}>
              © 2026 ClientPro CRM. Todos los derechos reservados.
            </motion.p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}

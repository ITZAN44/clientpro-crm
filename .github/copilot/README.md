# 📚 Configuración de GitHub Copilot - ClientPro CRM

Esta carpeta contiene las instrucciones y reglas que GitHub Copilot debe seguir en cada sesión de desarrollo.

## 📁 Estructura

```
.github/copilot/
├── README.md           ← Este archivo (explicación general)
├── instructions.md     ← Instrucciones de inicio de sesión
└── rules.md            ← Reglas fijas para cada sesión
```

## 🎯 Propósito

Garantizar que cada sesión de desarrollo con GitHub Copilot:
1. Comience con el contexto correcto
2. Siga las mejores prácticas establecidas
3. Mantenga consistencia en el código
4. Verifique errores apropiadamente
5. Use los MCPs correctos

## 📖 Cómo Usar

### Para GitHub Copilot (IA):

**Al inicio de cada sesión:**
1. Leer `instructions.md`
2. Ejecutar checklist de inicio
3. Conectar a base de datos
4. Iniciar aplicación
5. Activar MCPs necesarios
6. Leer contexto del proyecto

**Durante la sesión:**
1. Seguir `rules.md`
2. Verificar errores apropiadamente
3. Usar MCPs según contexto
4. Documentar cambios importantes
5. Validar integridad del código

### Para Desarrolladores Humanos:

**Si quieres que Copilot siga estas reglas:**
1. Referencia este archivo al inicio: "Lee .github/copilot/instructions.md"
2. Si hay dudas sobre workflow: "Consulta .github/copilot/rules.md"
3. Actualiza estos archivos cuando cambien las convenciones del proyecto

## 🔄 Actualización

Estos archivos deben actualizarse cuando:
- Cambie la estructura del proyecto
- Se agreguen nuevos MCPs
- Se establezcan nuevos patrones
- Se descubran mejores prácticas

## 📝 Versionamiento

- **Versión actual**: 1.0.0
- **Última actualización**: 18 de Enero de 2026
- **Autor**: Equipo de desarrollo ClientPro CRM

## 🔗 Referencias

- [Documentación del Proyecto](../../docs/CONTEXTO_PROYECTO.md)
- [Próximos Pasos](../../docs/PROXIMOS_PASOS.md)


---

**Nota**: Estos archivos son específicos para GitHub Copilot y su propósito es mejorar la calidad y consistencia del código generado por IA.

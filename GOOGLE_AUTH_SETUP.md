# Configuración de Google OAuth para ALQUID OpRisk

## Paso 1: Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** (necesaria para OAuth)

## Paso 2: Crear credenciales OAuth 2.0

1. En el menú lateral, ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Si es la primera vez, configura la pantalla de consentimiento:
   - Tipo de usuario: **Internal** (solo para tu organización)
   - Nombre de la aplicación: **ALQUID OpRisk**
   - Email de soporte: tu email @nfq.es
   - Dominios autorizados: `nfq.es`
   - Guarda y continúa

4. Crear el OAuth Client ID:
   - Tipo de aplicación: **Web application**
   - Nombre: **ALQUID OpRisk Web Client**
   - URIs de origen autorizados:
     - `http://localhost:5173` (para desarrollo)
     - Tu dominio de producción cuando lo tengas
   - URIs de redirección autorizados: (dejar vacío para Google Sign-In)

5. Haz clic en **Create**
6. **COPIA el Client ID** que aparece (algo como: `123456789-abc123.apps.googleusercontent.com`)

## Paso 3: Configurar el Client ID en la aplicación

1. Abre el archivo `services/googleAuth.ts`
2. Reemplaza la línea:
   ```typescript
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
   ```
   
   Con tu Client ID real:
   ```typescript
   const GOOGLE_CLIENT_ID = '123456789-abc123.apps.googleusercontent.com';
   ```

## Paso 4: Restricciones de dominio (Opcional pero recomendado)

Para mayor seguridad, en Google Cloud Console:

1. Ve a **OAuth consent screen**
2. En **Authorized domains**, añade: `nfq.es`
3. Esto asegura que solo usuarios con email @nfq.es puedan autenticarse

## Paso 5: Probar la autenticación

1. Inicia la aplicación: `npm run dev`
2. Ve a `http://localhost:5173`
3. Haz clic en el botón "Sign in with Google"
4. Selecciona tu cuenta @nfq.es
5. Si es la primera vez, acepta los permisos solicitados

## Funcionalidades implementadas

✅ **Login con Google OAuth 2.0**
- Popup de selección de cuenta de Google
- Validación automática de dominio @nfq.es
- Solo usuarios registrados en el sistema pueden acceder

✅ **Seguridad**
- Verificación de token JWT
- Validación de dominio de email
- Control de acceso basado en usuarios registrados

✅ **Experiencia de usuario**
- Botón nativo de Google Sign-In
- Mensajes de error claros
- Indicador de carga durante autenticación

## Notas importantes

- **Desarrollo local**: Funciona en `http://localhost:5173`
- **Producción**: Deberás añadir tu dominio de producción a los URIs autorizados
- **Usuarios**: Solo usuarios previamente creados por el Administrador pueden acceder
- **Dominio**: Solo emails @nfq.es son aceptados

## Troubleshooting

### Error: "Access restricted to NFQ employees"
- Asegúrate de usar una cuenta @nfq.es

### Error: "User not recognized"
- El usuario debe ser creado primero por un Administrador en User Management

### El botón de Google no aparece
- Verifica que el Client ID esté configurado correctamente
- Comprueba la consola del navegador para errores
- Asegúrate de que `http://localhost:5173` esté en los URIs autorizados

### Error de CORS
- Verifica que el origen esté en la lista de URIs autorizados en Google Cloud Console

# Wiki-Craft – cambios de autenticación, comunidad y versiones

## Archivos modificados
- `src/App.jsx`: todas las rutas del sitio requieren sesión, excepto `/login`.
- `src/context/AuthContext.jsx` y `src/components/RutaProtegida.jsx`: perfil en tiempo real, rol y suspensión.
- `src/pages/login.jsx` y `src/services/firestore.js`: creación automática del perfil de Firestore.
- `src/pages/comunidad.jsx`, `src/pages/Publicacion.jsx` y `src/components/comunidadComponentes/nuevo-post.jsx`: publicaciones reales en Firestore, autor UID real, edición/eliminación del dueño, denuncias persistentes y moderación admin. Las imágenes opcionales se agregan pegando una URL externa.
- `src/pages/versiones.jsx` y `src/components/versionesComponentes/agregar-version.jsx`: versiones persistidas en Firestore y CRUD admin; las imágenes se indican mediante URL externa, sin subir archivos.

## Aplicar las reglas
1. Firebase Console → Firestore Database → Rules: pegar el contenido de `firestore.rules`.
2. Publicar las reglas de Firestore. No hace falta configurar Firebase Storage.

## Campos de usuarios
Colección `usuarios`, documento ID = UID de Firebase Auth:
- `uid`: string
- `email`: string
- `nombreUsuario`: string
- `fotoPerfil`: string
- `biografia`: string
- `rol`: `usuario` o `admin`
- `estado`: `activo` o `suspendido`
- `fechaRegistro`: timestamp

El perfil se crea al registrar/iniciar sesión. No se debe permitir que el cliente elija el rol administrador. Para reconocer una cuenta como administradora, el documento `usuarios/{UID_ADMIN}` debe tener `rol: "admin"` (asignarlo desde Firebase Console o un entorno confiable).

## Colecciones
- `publicaciones`: autorId, autorNombre, autorFoto, categoria, contenido, imagen, comentarios, likes, editado y timestamps.
- `denuncias`: publicacionId, autorId, autorNombre, contenido, motivo, detalle, tipoContenido, denuncianteId, denuncianteNombre, estado y timestamps.
- `versiones`: datos de la versión y timestamps. La escritura está restringida a administradores.

## Importante
No puedo conectarme a tu proyecto Firebase desde el ZIP ni publicar reglas directamente en tu consola. El código crea documentos en tiempo de ejecución y migra las versiones iniciales al entrar un administrador si `versiones` está vacía. Las publicaciones y denuncias antiguas guardadas únicamente en `localStorage` no se migran: eran datos locales/de demostración y no deben convertirse en autores reales. La colección de Storage admite imágenes de publicaciones y versiones con las reglas incluidas.

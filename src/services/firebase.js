// ÍNDICE GENERAL
// 1. IMPORTACIONES DE DEPENDENCIAS DE FIREBASE
// 2. CONFIGURACIÓN DE CREDENCIALES Y VARIABLES DE ENTORNO
// 3. INICIALIZACIÓN DE LA APLICACIÓN PRINCIPAL
// 4. INICIALIZACIÓN Y EXPORTACIÓN DE SERVICIOS COMPARTIDOS

// 1. IMPORTACIONES DE DEPENDENCIAS DE FIREBASE

// Importamos las herramientas fundamentales del kit de desarrollo (SDK) de Firebase.
// Estas funciones vienen directamente desde los servidores de Google (a través de la carpeta node_modules)
// y nos permiten arrancar los distintos motores del sistema.
// 
// - initializeApp: Es la llave maestra. Toma nuestras credenciales y enciende la conexión 
//   oficial entre nuestra página web y nuestro proyecto en los servidores de Firebase.
import { initializeApp } from "firebase/app";

// - getAuth: Es el motor de identidad. Nos permite acceder al sistema de autenticación 
//   (registro, inicio de sesión, recuperación de contraseñas, perfiles de usuario).
import { getAuth } from "firebase/auth";

// - getFirestore: Es el motor de la base de datos NoSQL en la nube. Nos permite 
//   leer, guardar, editar o borrar documentos (como productos o canciones).
import { getFirestore } from "firebase/firestore";

// 2. CONFIGURACIÓN DE CREDENCIALES Y VARIABLES DE ENTORNO

// Propósito: Definir un objeto constante ("firebaseConfig") que contendrá todas 
// las claves públicas y rutas necesarias para que Firebase sepa a qué proyecto exacto 
// de sus servidores nos queremos conectar.
// 
// IMPORTANTE: USO DE VARIABLES DE ENTORNO (import.meta.env)
// En lugar de escribir las claves secretas directamente acá (como "AIzaSyD..."),
// se utiliza el objeto "import.meta.env". Esto es una herramienta del sistema Vite 
// (el programa que compila nuestro código React).
// 
// ¿Cómo funciona? 
// Vite lee un archivo de texto oculto llamado ".env" que está guardado en tu computadora 
// pero que NUNCA se sube a internet (está ignorado en GitHub). Vite toma los valores 
// de ese archivo y los inyecta acá dinámicamente. 
// Las variables obligatoriamente deben empezar con "VITE_" para que el sistema permita leerlas.
//
// EJEMPLO PRÁCTICO:
// - Vite lee tu archivo local: VITE_FIREBASE_PROJECT_ID="wiki-craft-db"
// - Al compilar, reemplaza import.meta.env.VITE_FIREBASE_PROJECT_ID por "wiki-craft-db".
// - De esta manera, el código funciona sin que expongas tus datos en repositorios públicos.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 3. INICIALIZACIÓN DE LA APLICACIÓN PRINCIPAL

// Propósito: Encender el sistema de Firebase y asignarlo a una constante llamada "app".
// Proceso:
// - Ejecuta la función initializeApp() enviándole el objeto de configuración (firebaseConfig)
//   que preparamos en el paso anterior.
// - Firebase procesa esas claves, verifica que existan, y abre una conexión oficial segura.
// - La constante "app" almacena esa conexión activa. Sin este paso, ninguno de los otros 
//   servicios (como la base de datos o el login) podría funcionar.
const app = initializeApp(firebaseConfig);

// 4. INICIALIZACIÓN Y EXPORTACIÓN DE SERVICIOS COMPARTIDOS

// Propósito: Encender los motores individuales (Autenticación y Base de Datos) pasándoles
// la conexión oficial que acabamos de crear, y exportarlos para que todo el sitio web pueda usarlos.

// "export const auth": Enciende el sistema de cuentas vinculándolo a nuestra aplicación ("app").
// Al usar "export", cualquier otro archivo del proyecto podrá simplemente pedir "auth" 
// para saber quién inició sesión, sin tener que volver a configurar nada.
export const auth = getAuth(app);

// "export const db": Enciende el motor de base de datos Firestore vinculado a nuestra "app".
// Guardamos esta conexión en la constante "db" (abreviatura de database).
// Es la misma variable "db" que venimos importando en todos los demás archivos (como firestore.js)
// para realizar búsquedas, guardados y eliminaciones.
export const db = getFirestore(app);

// Propósito: Exportar por defecto la aplicación entera.
// Si algún otro módulo necesita acceder a propiedades avanzadas del núcleo de Firebase 
// (por ejemplo, para Firebase Storage o Cloud Functions), puede importar "app" directamente.
export default app;
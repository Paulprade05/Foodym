# Foodym — Generador de Rutinas y Recetas

Aplicación web (React + Vite + Tailwind CSS) con interfaz íntegra en español, login con
Google, sincronización entre dispositivos (Firebase) y animaciones fluidas (Framer Motion).
Iconografía con `lucide-react` (sin emojis).

Tres secciones:

1. **Recetas** — busca recetas a partir de los ingredientes de tu despensa (los escribes en
   **español** y se traducen automáticamente) y de los **utensilios de cocina** que tengas
   (freidora de aire, horno, sartén, microondas…). API de
   [Spoonacular](https://spoonacular.com/food-api). Se adapta a tus **gustos** (ver abajo).
2. **Rutinas** — genera ejercicios eligiendo **qué músculos** entrenar y **con qué
   equipamiento** (separado en casa / gimnasio). Cada ejercicio muestra **imágenes reales** de
   la técnica (que se alternan para simular el movimiento) + un botón a un **vídeo explicativo**.
   Datos de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (open source).
3. **Favoritos** — guarda recetas y ejercicios; con sesión iniciada se **sincronizan entre
   todos tus dispositivos**.

**Mis gustos:** al abrir la app por primera vez te preguntamos tus preferencias (dieta,
alergias/intolerancias, cocinas favoritas, ingredientes que no te gustan y tiempo máximo de
preparación). Se aplican a todas las búsquedas de recetas y puedes editarlas cuando quieras
desde el botón "Mis gustos".

---

## Funciona sin configurar nada

- **Recetas:** clave de Spoonacular ya incluida en `.env`.
- **Ejercicios:** base de datos libre, **sin clave**.
- **Traducción de ingredientes:** API gratuita de MyMemory, **sin clave**.
- **Datos del usuario:** se guardan en el navegador (modo local) hasta que conectes Firebase.

```bash
npm install
npm run dev      # abre http://localhost:5173
```

Para activar **login con Google + sincronización entre dispositivos**, configura Firebase
(opcional) rellenando las variables `VITE_FIREBASE_*` del `.env`.

---

## Configurar Firebase (opcional: login + sincronización)

1. [Consola de Firebase](https://console.firebase.google.com) → **Agregar proyecto**.
2. **Authentication** → *Sign-in method* → habilita **Google**.
3. **Firestore Database** → *Crear base de datos* → modo producción → elige región.
4. En **Reglas** de Firestore (cada usuario solo accede a sus datos):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
5. **Project settings** (⚙️) → *Tus apps* → app **Web** (`</>`) → copia el `firebaseConfig` a
   las variables `VITE_FIREBASE_*` del `.env`.
6. **Authentication → Settings → Dominios autorizados**: añade `localhost` y tu dominio de
   Vercel tras desplegar.

> En Vite las variables `VITE_*` viajan al navegador: no son secretas. Reinicia `npm run dev`
> tras editar el `.env`.

---

## Publicar en Vercel

`vercel.json` ya está configurado.

```bash
npm i -g vercel
vercel login         # se abre el navegador para iniciar sesión (paso manual)
vercel               # despliegue de prueba
vercel --prod        # producción
```

Añade las variables `VITE_*` en *Project → Settings → Environment Variables* (o `vercel env add`).
Recuerda añadir el dominio final de Vercel a los dominios autorizados de Firebase Auth.

```bash
npm run build     # build de producción en /dist
npm run preview   # sirve el build localmente
```

---

## Estructura

```
src/
├── App.jsx                      # Layout, barra superior, pestañas, transiciones, onboarding
├── main.jsx
├── index.css                   # Tailwind + utilidades (botones, panel, spinner)
├── firebase/config.js           # Init Firebase con degradación a modo local
├── context/AuthContext.jsx      # Sesión + login/logout con Google
├── hooks/useUserData.js         # Datos: Firestore (sync) o localStorage; prefs y favoritos
├── constants/preferences.js     # Opciones de dieta/intolerancias/cocinas/tiempo
├── services/
│   ├── spoonacular.js           # Recetas + utensilios + preferencias
│   ├── exercises.js             # free-exercise-db + grupos de músculos y equipamiento
│   └── translate.js             # Traducción ES->EN (diccionario + MyMemory + caché)
├── utils/translations.js        # Traducción de músculos/equipo/nivel al español
└── components/
    ├── TabNavigation.jsx        ├── AuthButton.jsx
    ├── IngredientInput.jsx      ├── ChipSelect.jsx
    ├── PreferencesModal.jsx     ├── FavoriteButton.jsx
    ├── RecipeCard.jsx           ├── ExerciseCard.jsx
    ├── RecipesSection.jsx       ├── ExercisesSection.jsx
    ├── FavoritesSection.jsx     ├── Spinner.jsx   └── ErrorMessage.jsx
```

---

## Notas técnicas

- **Diseño:** `lucide-react` para iconografía, Framer Motion para transiciones de pestaña,
  indicador deslizante, entrada escalonada de tarjetas y el modal de gustos.
- **Traducción de ingredientes:** un diccionario local cubre los ingredientes más comunes
  (instantáneo, sin red) y el resto se traduce con MyMemory, cacheando en `localStorage`. Si la
  traducción falla, se usa el término original (la app nunca se rompe).
- **Ejercicios:** el dataset (873 ejercicios) se descarga una vez y se filtra en cliente por
  grupo muscular y equipamiento. Cada tarjeta alterna dos imágenes (inicio/fin del movimiento)
  para simular la animación, e incluye nivel, músculos, instrucciones y vídeo de YouTube.
- **Errores:** todas las peticiones capturan fallos de red/API (401/402/429…) y muestran un
  mensaje claro con botón **Reintentar**, sin romper la app.
- **Persistencia:** con sesión Google los datos viven en Firestore (`users/{uid}`) con escucha
  en tiempo real; sin sesión, en `localStorage`. Al iniciar sesión por primera vez se migran los
  datos locales a la nube.
- **Idioma:** todo se muestra en español. La interfaz y las etiquetas (músculo, equipamiento,
  nivel, dieta…) están traducidas de forma fija; los **nombres y las instrucciones de los
  ejercicios** y los **títulos de las recetas** (que las APIs devuelven en inglés) se traducen
  automáticamente al vuelo con caché (Google Translate gtx con respaldo en MyMemory). Si una
  traducción falla, se muestra el texto original en lugar de romperse.
```

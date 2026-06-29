# Foodym — Generador de Rutinas y Recetas

Aplicación web (React + Vite + Tailwind CSS) con interfaz íntegra en español, login por
enlace mágico al correo, sincronización entre dispositivos (Supabase) y animaciones fluidas
(Framer Motion). Iconografía con `lucide-react` (sin emojis).

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
- **Traducción de ingredientes:** Google Translate (gtx) / MyMemory, **sin clave**.
- **Datos del usuario:** se guardan en el navegador (modo local) hasta que conectes Supabase.

```bash
npm install
npm run dev      # abre http://localhost:5173
```

Para activar **login + sincronización entre dispositivos**, configura Supabase (opcional)
rellenando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` del `.env`.

---

## Configurar Supabase (opcional: login + sincronización)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → ejecuta esto (crea la tabla, la seguridad por fila y el tiempo real):
   ```sql
   create table if not exists public.user_data (
     user_id uuid primary key references auth.users on delete cascade,
     data jsonb not null default '{}',
     updated_at timestamptz not null default now()
   );
   alter table public.user_data enable row level security;
   create policy "own_data" on public.user_data
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
   alter publication supabase_realtime add table public.user_data;
   ```
3. **Authentication → Providers → Email**: deja activado *Email* (el enlace mágico funciona por
   defecto; no hace falta contraseña).
4. **Authentication → URL Configuration**: pon tu URL del sitio como *Site URL* y añádela a
   *Redirect URLs* (p. ej. `https://paulprade05.github.io/Foodym/` y `http://localhost:5173`).
5. **Settings → API**: copia *Project URL* y la clave *anon public* a `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` del `.env`.

> La clave *anon* es pública por diseño (la seguridad la da el *Row Level Security* de la tabla).
> Reinicia `npm run dev` tras editar el `.env`.

---

## Publicación (GitHub Pages)

La web está publicada en **https://paulprade05.github.io/Foodym/** mediante GitHub Actions
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)): cada `git push` a `main`
recompila y republica automáticamente.

Las claves se guardan como *Secrets* del repositorio (*Settings → Secrets and variables →
Actions*): `VITE_SPOONACULAR_API_KEY` y, para login/sincronización, `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY`. Tras añadir o cambiar secrets, relanza el workflow (o haz un push).

Si configuras Supabase, añade `https://paulprade05.github.io/Foodym/` a las *Redirect URLs* de
Supabase (Authentication → URL Configuration).

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
├── supabase/config.js           # Init Supabase con degradación a modo local
├── context/AuthContext.jsx      # Sesión + login por enlace mágico (email)
├── hooks/useUserData.js         # Datos: Supabase (sync) o localStorage; prefs y favoritos
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
- **Persistencia:** con sesión iniciada los datos viven en Supabase (tabla `user_data`, una
  fila por usuario con la seguridad por fila) y se sincronizan en tiempo real; sin sesión, en
  `localStorage`. Al iniciar sesión por primera vez se migran los datos locales a la nube.
- **Idioma:** todo se muestra en español. La interfaz y las etiquetas (músculo, equipamiento,
  nivel, dieta…) están traducidas de forma fija; los **nombres y las instrucciones de los
  ejercicios** y los **títulos de las recetas** (que las APIs devuelven en inglés) se traducen
  automáticamente al vuelo con caché (Google Translate gtx con respaldo en MyMemory). Si una
  traducción falla, se muestra el texto original en lugar de romperse.
```

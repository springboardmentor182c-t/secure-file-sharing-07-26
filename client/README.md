# React Frontend — Springboard Tasks

This is the React frontend for the Springboard internship project.

## Directory Structure

```text
client/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── logo.svg
└── src/
    ├── assets/
    │   ├── global.css        # Design system + CSS variables
    │   └── logo.svg
    ├── components/
    │   ├── Form/             # Checkbox, FormInput, FormSelect, RadioButton
    │   ├── Buttons/          # ButtonGroup, Dropdown
    │   └── Modals/           # Modal
    ├── context/
    │   └── AnalyticsContext.js   # Auth state, theme, user session
    ├── data/
    │   ├── configValues.json
    │   ├── constants.js
    │   └── defaultTools.json
    ├── features/
    │   └── authentication/
    │       ├── components/   # LoginForm, SignupForm
    │       ├── hooks/        # useSignup, useVerifyPassword
    │       └── services/     # login, signup, getUsers
    ├── hooks/
    │   ├── useFetch.js       # Generic authenticated fetch hook
    │   └── useLocalStorage.js
    ├── layout/
    │   ├── Navbar.js         # Sticky top navigation
    │   ├── PageContainer.js  # Layout wrapper (Navbar + Sidebar + main)
    │   └── Sidebar.js        # Left navigation sidebar
    ├── pages/
    │   ├── Home.js           # Dashboard / Todo management
    │   ├── Login.js
    │   ├── Settings.js       # Profile + Theme preferences
    │   └── Signup.js
    ├── tests/                # Placeholder for component tests
    ├── utils/
    │   ├── formatCurrency.js
    │   ├── formatDate.js
    │   └── tests/            # Placeholder for utility tests
    ├── App.js                # Router + Protected routes
    ├── index.js              # React entry point
    └── reportWebVitals.js
```

## Running the App

```bash
npm install
npm start
```

The app will be served at `http://localhost:3000`.

The `proxy` field in `package.json` forwards all `/api/` calls to `http://localhost:8000`.
Make sure the FastAPI backend is running before starting the React dev server.

## Key Design Choices

- **Dark mode by default** with a live theme toggle (persisted to server)
- **Protected routes** — unauthenticated users are redirected to `/login`
- **AnalyticsContext** — shared global state for auth token, user profile, and theme
- **`useFetch`** hook — pre-configured with Authorization headers and auto-logout on 401

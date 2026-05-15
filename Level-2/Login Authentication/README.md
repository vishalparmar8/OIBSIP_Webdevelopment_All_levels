# Login Authentication

A small Node.js login authentication demo with registration, login, logout, and a secured page. It uses only built-in Node modules, so there is no dependency install step.

## Features

- Register a new user
- Login with username and password
- Access `/secure` only after logging in
- Logout and clear the session
- Store users and sessions in `data.json`
- Hash passwords with salted PBKDF2 instead of storing plain text

## Run

```powershell
node server.js
```

Then open:

```text
http://127.0.0.1:8000
```

The app creates `data.json` automatically the first time it starts.

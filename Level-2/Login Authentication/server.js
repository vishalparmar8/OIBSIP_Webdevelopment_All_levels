const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const querystring = require("node:querystring");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8000);
const DATA_FILE = path.resolve(process.env.AUTH_DATA_FILE || path.join(__dirname, "data.json"));
const SESSION_COOKIE = "login_auth_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 200000;
const PBKDF2_KEY_LENGTH = 32;

async function readStore() {
  try {
    const rawData = await fs.readFile(DATA_FILE, "utf8");
    const store = JSON.parse(rawData);
    return {
      users: Array.isArray(store.users) ? store.users : [],
      sessions: Array.isArray(store.sessions) ? store.sessions : []
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { users: [], sessions: [] };
    }
    throw error;
  }
}

async function writeStore(store) {
  const activeSessions = store.sessions.filter((session) => session.expiresAt > Date.now());
  const nextStore = {
    users: store.users,
    sessions: activeSessions
  };
  await fs.writeFile(DATA_FILE, `${JSON.stringify(nextStore, null, 2)}\n`);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64");
  const digest = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, "sha256")
    .toString("base64");

  return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${salt}$${digest}`;
}

function verifyPassword(password, storedHash) {
  const [algorithm, iterations, salt, expectedDigest] = storedHash.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterations || !salt || !expectedDigest) {
    return false;
  }

  const digest = crypto
    .pbkdf2Sync(password, salt, Number(iterations), PBKDF2_KEY_LENGTH, "sha256")
    .toString("base64");

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(expectedDigest));
}

function createSession(userId) {
  return {
    token: crypto.randomBytes(32).toString("base64url"),
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, pair) => {
    const [rawName, ...rawValue] = pair.trim().split("=");
    if (!rawName) {
      return cookies;
    }
    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function sessionCookie(token, maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

function clearSessionCookie() {
  return sessionCookie("", 0);
}

function pageLayout(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Login Authentication</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f5f7fb;
      color: #172033;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px 16px;
      background:
        radial-gradient(circle at top left, rgba(58, 151, 212, 0.18), transparent 32rem),
        linear-gradient(135deg, #f5f7fb 0%, #eef3f8 100%);
    }

    main {
      width: min(100%, 440px);
      background: #ffffff;
      border: 1px solid #dce4ef;
      border-radius: 8px;
      box-shadow: 0 18px 48px rgba(23, 32, 51, 0.12);
      padding: 32px;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 30px;
      line-height: 1.15;
      letter-spacing: 0;
    }

    p {
      color: #556176;
      line-height: 1.6;
      margin: 0 0 22px;
    }

    form {
      display: grid;
      gap: 16px;
    }

    label {
      display: grid;
      gap: 7px;
      color: #2c3446;
      font-weight: 650;
      font-size: 14px;
    }

    input {
      width: 100%;
      border: 1px solid #c7d2e2;
      border-radius: 6px;
      padding: 12px 13px;
      font: inherit;
      color: #172033;
      background: #fff;
    }

    input:focus {
      border-color: #2f80ed;
      box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.16);
      outline: none;
    }

    .password-field {
      position: relative;
    }

    .password-field input {
      padding-right: 54px;
    }

    button,
    .button {
      border: 0;
      border-radius: 6px;
      background: #1f6fd1;
      color: #fff;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 11px 16px;
      font: inherit;
      font-weight: 750;
      text-decoration: none;
    }

    button:hover,
    .button:hover {
      background: #185eb5;
    }

    .password-toggle {
      background: #ecf2f9;
      color: #31405a;
      height: 34px;
      min-height: 34px;
      padding: 0;
      position: absolute;
      right: 7px;
      top: 50%;
      transform: translateY(-50%);
      width: 34px;
    }

    .password-toggle:hover {
      background: #dce8f5;
    }

    .password-toggle svg {
      height: 18px;
      width: 18px;
    }

    .secondary {
      color: #31405a;
      background: #ecf2f9;
    }

    .secondary:hover {
      background: #dce8f5;
    }

    .actions {
      display: grid;
      gap: 12px;
      margin-top: 22px;
    }

    .inline-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 22px;
    }

    .alert {
      border-radius: 6px;
      margin-bottom: 18px;
      padding: 12px 14px;
      line-height: 1.5;
    }

    .error {
      background: #ffe9e9;
      color: #8a1f1f;
      border: 1px solid #ffc7c7;
    }

    .success {
      background: #e8f7ef;
      color: #17683b;
      border: 1px solid #b7e3ca;
    }

    .meta {
      font-size: 14px;
      margin-top: 18px;
      text-align: center;
    }

    .meta a {
      color: #185eb5;
      font-weight: 700;
    }

    @media (max-width: 520px) {
      main {
        padding: 24px;
      }

      h1 {
        font-size: 26px;
      }
    }
  </style>
</head>
<body>
  <main>
    ${body}
  </main>
  <script>
    document.querySelectorAll("[data-toggle-password]").forEach((button) => {
      const input = document.getElementById(button.dataset.togglePassword);

      if (!input) {
        return;
      }

      button.addEventListener("click", () => {
        const shouldShow = input.type === "password";
        const label = shouldShow ? "Hide password" : "Show password";

        input.type = shouldShow ? "text" : "password";
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        button.setAttribute("aria-pressed", String(shouldShow));
      });
    });
  </script>
</body>
</html>`;
}

function alert(message, kind = "error") {
  return `<div class="alert ${kind}">${escapeHtml(message)}</div>`;
}

function passwordField({ id, name, label, autocomplete }) {
  return `
    <label>
      ${escapeHtml(label)}
      <span class="password-field">
        <input id="${id}" name="${name}" type="password" autocomplete="${autocomplete}" minlength="6" required>
        <button
          class="password-toggle"
          type="button"
          data-toggle-password="${id}"
          aria-controls="${id}"
          aria-label="Show password"
          aria-pressed="false"
          title="Show password"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </span>
    </label>
  `;
}

function formPage({
  title,
  description,
  action,
  buttonText,
  footerText,
  footerHref,
  footerLink,
  message = "",
  messageKind = "error",
  includeConfirmPassword = false
}) {
  const messageMarkup = message ? alert(message, messageKind) : "";
  const passwordAutocomplete = includeConfirmPassword ? "new-password" : "current-password";
  const confirmPasswordMarkup = includeConfirmPassword
    ? passwordField({
        id: "confirmPassword",
        name: "confirmPassword",
        label: "Confirm password",
        autocomplete: "new-password"
      })
    : "";

  return pageLayout(
    title,
    `
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      ${messageMarkup}
      <form method="post" action="${action}">
        <label>
          Username
          <input name="username" autocomplete="username" minlength="3" maxlength="30" required>
        </label>
        ${passwordField({
          id: "password",
          name: "password",
          label: "Password",
          autocomplete: passwordAutocomplete
        })}
        ${confirmPasswordMarkup}
        <button type="submit">${escapeHtml(buttonText)}</button>
      </form>
      <p class="meta">
        ${escapeHtml(footerText)}
        <a href="${footerHref}">${escapeHtml(footerLink)}</a>
      </p>
    `
  );
}

function sendHtml(response, html, statusCode = 200, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html),
    ...headers
  });
  response.end(html);
}

function redirect(response, location, headers = {}) {
  response.writeHead(303, {
    Location: location,
    ...headers
  });
  response.end();
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function validateCredentials(username, password) {
  if (username.length < 3 || username.length > 30) {
    return "Username must be between 3 and 30 characters.";
  }

  if (!/^[A-Za-z0-9_-]+$/.test(username)) {
    return "Username can only contain letters, numbers, hyphens, and underscores.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return "";
}

async function currentUser(request, store) {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) {
    return null;
  }

  const session = store.sessions.find(
    (candidate) => candidate.token === token && candidate.expiresAt > Date.now()
  );
  if (!session) {
    return null;
  }

  return store.users.find((user) => user.id === session.userId) || null;
}

async function handleHome(request, response, store) {
  const user = await currentUser(request, store);
  if (user) {
    redirect(response, "/secure");
    return;
  }

  sendHtml(
    response,
    pageLayout(
      "Home",
      `
        <h1>Login Authentication</h1>
        <p>Create an account, sign in, and view a secured page protected by a server-side session.</p>
        <div class="actions">
          <a class="button" href="/register">Create account</a>
          <a class="button secondary" href="/login">Sign in</a>
        </div>
      `
    )
  );
}

function handleRegisterForm(response, message = "", messageKind = "error") {
  sendHtml(
    response,
    formPage({
      title: "Create account",
      description: "Choose a username and password to register.",
      action: "/register",
      buttonText: "Register",
      footerText: "Already have an account?",
      footerHref: "/login",
      footerLink: "Sign in",
      message,
      messageKind,
      includeConfirmPassword: true
    })
  );
}

function handleLoginForm(response, message = "", messageKind = "error") {
  sendHtml(
    response,
    formPage({
      title: "Welcome back",
      description: "Sign in to access the secured page.",
      action: "/login",
      buttonText: "Sign in",
      footerText: "Need an account?",
      footerHref: "/register",
      footerLink: "Register",
      message,
      messageKind
    })
  );
}

async function handleRegister(request, response, store) {
  const form = querystring.parse(await readRequestBody(request));
  const username = String(form.username || "").trim();
  const password = String(form.password || "");
  const confirmPassword = String(form.confirmPassword || "");
  const validationError = validateCredentials(username, password);

  if (validationError) {
    handleRegisterForm(response, validationError);
    return;
  }

  if (password !== confirmPassword) {
    handleRegisterForm(response, "Passwords do not match.");
    return;
  }

  const existingUser = store.users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );
  if (existingUser) {
    handleRegisterForm(response, "That username is already taken.");
    return;
  }

  const user = {
    id: crypto.randomUUID(),
    username,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };
  const session = createSession(user.id);

  store.users.push(user);
  store.sessions.push(session);
  await writeStore(store);

  redirect(response, "/secure", {
    "Set-Cookie": sessionCookie(session.token)
  });
}

async function handleLogin(request, response, store) {
  const form = querystring.parse(await readRequestBody(request));
  const username = String(form.username || "").trim();
  const password = String(form.password || "");
  const user = store.users.find(
    (candidate) => candidate.username.toLowerCase() === username.toLowerCase()
  );

  if (!user || !verifyPassword(password, user.passwordHash)) {
    handleLoginForm(response, "Invalid username or password.");
    return;
  }

  const session = createSession(user.id);
  store.sessions.push(session);
  await writeStore(store);

  redirect(response, "/secure", {
    "Set-Cookie": sessionCookie(session.token)
  });
}

async function handleSecurePage(request, response, store) {
  const user = await currentUser(request, store);
  if (!user) {
    redirect(response, "/login");
    return;
  }

  sendHtml(
    response,
    pageLayout(
      "Secured Page",
      `
        <h1>Secured page</h1>
        <p>Hello, <strong>${escapeHtml(user.username)}</strong>. You can see this page because your login session is valid.</p>
        <div class="inline-actions">
          <a class="button" href="/">Home</a>
          <a class="button secondary" href="/logout">Logout</a>
        </div>
      `
    )
  );
}

async function handleLogout(request, response, store) {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  store.sessions = store.sessions.filter((session) => session.token !== token);
  await writeStore(store);

  redirect(response, "/login", {
    "Set-Cookie": clearSessionCookie()
  });
}

function handleNotFound(response) {
  sendHtml(
    response,
    pageLayout(
      "Not Found",
      `
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <div class="actions">
          <a class="button" href="/">Go home</a>
        </div>
      `
    ),
    404
  );
}

async function handleRequest(request, response) {
  try {
    const store = await readStore();
    const url = new URL(request.url, `http://${request.headers.host}`);
    const route = `${request.method} ${url.pathname}`;

    if (route === "GET /") {
      await handleHome(request, response, store);
    } else if (route === "GET /register") {
      handleRegisterForm(response);
    } else if (route === "POST /register") {
      await handleRegister(request, response, store);
    } else if (route === "GET /login") {
      handleLoginForm(response);
    } else if (route === "POST /login") {
      await handleLogin(request, response, store);
    } else if (route === "GET /secure") {
      await handleSecurePage(request, response, store);
    } else if (route === "GET /logout") {
      await handleLogout(request, response, store);
    } else {
      handleNotFound(response);
    }
  } catch (error) {
    console.error(error);
    sendHtml(
      response,
      pageLayout(
        "Server Error",
        `
          <h1>Server error</h1>
          <p>Something went wrong while processing your request.</p>
          <div class="actions">
            <a class="button" href="/">Go home</a>
          </div>
        `
      ),
      500
    );
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

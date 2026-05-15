const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");

const port = 8100 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;
const testDataFile = path.join(__dirname, ".tmp-auth-test.json");

async function removeTestDataFile() {
  try {
    await fs.unlink(testDataFile);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function startServer() {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: String(port),
      AUTH_DATA_FILE: testDataFile
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForServer(child) {
  const deadline = Date.now() + 5000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited early with code ${child.exitCode}.`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      await delay(100);
    }
  }

  throw new Error("Timed out waiting for the test server to start.");
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  await removeTestDataFile();
  const server = startServer();

  try {
    await waitForServer(server);

    const protectedBeforeLogin = await fetch(`${baseUrl}/secure`, {
      redirect: "manual"
    });
    expect(protectedBeforeLogin.status === 303, "Secured page should redirect anonymous users.");
    expect(
      protectedBeforeLogin.headers.get("location") === "/login",
      "Anonymous users should be redirected to /login."
    );

    const registerPageResponse = await fetch(`${baseUrl}/register`);
    const registerPageHtml = await registerPageResponse.text();
    expect(registerPageHtml.includes('name="confirmPassword"'), "Registration should ask for password confirmation.");
    expect(registerPageHtml.includes("data-toggle-password"), "Password fields should include reveal controls.");

    const mismatchedPasswordResponse = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        username: "codextest",
        password: "password123",
        confirmPassword: "different123"
      })
    });
    const mismatchedPasswordHtml = await mismatchedPasswordResponse.text();
    expect(mismatchedPasswordResponse.ok, "Mismatched passwords should return the registration form.");
    expect(
      mismatchedPasswordHtml.includes("Passwords do not match."),
      "Mismatched passwords should show a clear error."
    );

    const registerResponse = await fetch(`${baseUrl}/register`, {
      method: "POST",
      redirect: "manual",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        username: "codextest",
        password: "password123",
        confirmPassword: "password123"
      })
    });
    const sessionCookie = registerResponse.headers.get("set-cookie");
    expect(registerResponse.status === 303, "Registration should redirect after success.");
    expect(registerResponse.headers.get("location") === "/secure", "Registration should go to /secure.");
    expect(sessionCookie?.includes("login_auth_session="), "Registration should create a session cookie.");

    const protectedAfterLogin = await fetch(`${baseUrl}/secure`, {
      headers: {
        Cookie: sessionCookie
      }
    });
    const protectedHtml = await protectedAfterLogin.text();
    expect(protectedAfterLogin.ok, "Logged-in users should access the secured page.");
    expect(protectedHtml.includes("Hello, <strong>codextest</strong>"), "Secured page should greet the user.");

    const logoutResponse = await fetch(`${baseUrl}/logout`, {
      redirect: "manual",
      headers: {
        Cookie: sessionCookie
      }
    });
    expect(logoutResponse.status === 303, "Logout should redirect.");
    expect(logoutResponse.headers.get("location") === "/login", "Logout should go to /login.");

    console.log("Auth flow test passed.");
  } finally {
    server.kill();
    await removeTestDataFile();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

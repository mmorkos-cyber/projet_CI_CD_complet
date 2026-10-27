const { test, before, after } = require("node:test");
const assert = require("node:assert");
const axios = require("axios");

const app = require("../server.js");

let server;
let baseUrl;

const opts = { validateStatus: () => true };

before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
    server.close();
});

test("POST /login renvoie 200 si les identifiants sont corrects", async () => {
    const body = { username: "admin", password: "docker" };
    const response = await axios.post(`${baseUrl}/login`, body, opts);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    assert.strictEqual(response.data.message, "Bienvenue. Et surtout, ne touche pas au bouton.");
});

test("POST /login renvoie 401 si les identifiants sont incorrects", async () => {
    const body = { username: "admino", password: "dockerino" };
    const response = await axios.post(`${baseUrl}/login`, body, opts);

    assert.strictEqual(response.status, 401);
    assert.strictEqual(response.data.success, false);
    assert.strictEqual(response.data.message, "Identifiants incorrects.");
});

test("POST /click renvoie un message et un count si le compteur est entre 1 et 30", async () => {
    const body = { count: 24 };
    const response = await axios.post(`${baseUrl}/click`, body, opts);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.count, 24);
    assert.strictEqual(response.data.message, "Internet fonctionne désormais au charbon.");
    assert.strictEqual(response.data.finished, false);
});

test("POST /click renvoie 400 si le compteur est hors de 1 et 30", async () => {
    const body = { count: 42 };
    const response = await axios.post(`${baseUrl}/click`, body, opts);

    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.data.error, "Le nombre de clics doit être compris entre 1 et 30.");
});

test("les en-têtes CORS sont présents", async () => {
    const res = await fetch(`${baseUrl}/test`);

    assert.strictEqual(res.headers.get("access-control-allow-origin"), "*");
});

test("une route inconnue renvoie 404", async () => {
    const res = await fetch(`${baseUrl}/route-inexistante`);

    assert.strictEqual(res.status, 404);
});
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { context, createServer, getServerPort, reddit } from '@devvit/web/server';

const app = new Hono();
const internal = new Hono();
const api = new Hono();

const BACKEND_URL = 'https://sortling-bot.onrender.com';

// ── Proxy Endpoints for Webview Client ─────────────────────────────────────

api.get('/university', async (c) => {
  try {
    const url = new URL(c.req.url);
    const targetUrl = `${BACKEND_URL}/api/university${url.search}`;
    const res = await fetch(targetUrl);
    const data = await res.json();
    return c.json(data, res.status as any);
  } catch (err) {
    return c.json({ error: 'Backend API unavailable', details: String(err) }, 502);
  }
});

api.get('/clubs', async (c) => {
  try {
    const url = new URL(c.req.url);
    const targetUrl = `${BACKEND_URL}/api/clubs${url.search}`;
    const res = await fetch(targetUrl);
    const data = await res.json();
    return c.json(data, res.status as any);
  } catch (err) {
    return c.json({ error: 'Backend API unavailable', details: String(err) }, 502);
  }
});

api.get('/events', async (c) => {
  try {
    const url = new URL(c.req.url);
    const targetUrl = `${BACKEND_URL}/api/events${url.search}`;
    const res = await fetch(targetUrl);
    const data = await res.json();
    return c.json(data, res.status as any);
  } catch (err) {
    return c.json({ error: 'Backend API unavailable', details: String(err) }, 502);
  }
});

api.post('/sort/session', async (c) => {
  try {
    const body = await c.req.json();
    const res = await fetch(`${BACKEND_URL}/api/sort/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return c.json(data, res.status as any);
  } catch (err) {
    return c.json({ error: 'Backend API unavailable', details: String(err) }, 502);
  }
});

api.post('/sort/answer', async (c) => {
  try {
    const body = await c.req.json();
    const res = await fetch(`${BACKEND_URL}/api/sort/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return c.json(data, res.status as any);
  } catch (err) {
    return c.json({ error: 'Backend API unavailable', details: String(err) }, 502);
  }
});

app.route('/api', api);

// ── Internal Triggers & Moderator Menu Handlers ─────────────────────────────

internal.post('/triggers/on-app-install', async (c) => {
  try {
    const subName = context.subredditName;
    if (subName) {
      const post = await reddit.submitCustomPost({
        title: 'Sortling • Campus Club & Event Guide',
        subredditName: subName,
        entry: 'default',
      });
      console.log(`AppInstall: Created Sortling post (${post.id})`);
    }
    return c.json({ status: 'success' }, 200);
  } catch (error) {
    console.error('AppInstall error:', error);
    return c.json({ status: 'error', message: String(error) }, 500);
  }
});

internal.post('/triggers/on-app-upgrade', async (c) => {
  try {
    const subName = context.subredditName;
    if (subName) {
      const post = await reddit.submitCustomPost({
        title: 'Sortling • Campus Club & Event Guide',
        subredditName: subName,
        entry: 'default',
      });
      console.log(`AppUpgrade: Created Sortling post (${post.id})`);
    }
    return c.json({ status: 'success' }, 200);
  } catch (error) {
    console.error('AppUpgrade error:', error);
    return c.json({ status: 'error', message: String(error) }, 500);
  }
});

internal.post('/menu/post-create', async (c) => {
  try {
    const subName = context.subredditName || 'sortling_dev';
    const post = await reddit.submitCustomPost({
      title: 'Sortling • Campus Club & Event Guide',
      subredditName: subName,
      entry: 'default',
    });

    return c.json(
      {
        navigateTo: post.url,
        showToast: 'Sortling Custom Post created successfully!',
      },
      200
    );
  } catch (error: any) {
    console.error('Submit post error:', error);
    return c.json({ showToast: `Error: ${error?.message || String(error)}` }, 400);
  }
});

app.route('/internal', internal);

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});

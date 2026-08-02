import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { context, createServer, getServerPort, reddit } from '@devvit/web/server';
import { CLUBS_DATA, EVENTS_DATA } from './data.js';
import { createSession, submitAnswer } from './engine.js';

const app = new Hono();
const internal = new Hono();
const api = new Hono();

// ── Standalone REST API Endpoints (100% Native on Devvit) ───────────────────

api.get('/university', (c) => {
  return c.json({
    id: 1,
    slug: 'mahindra',
    name: 'Mahindra University',
    website: 'https://www.mahindrauniversity.edu.in',
    description: 'Mahindra University Verified Campus Directory & Club Finder',
    reddit_subreddit: 'sortling_dev',
  });
});

api.get('/clubs', (c) => {
  const query = (c.req.query('query') || '').toLowerCase().trim();
  let clubs = CLUBS_DATA;
  if (query) {
    clubs = CLUBS_DATA.filter(
      (club) =>
        club.name.toLowerCase().includes(query) ||
        club.description.toLowerCase().includes(query) ||
        club.category.toLowerCase().includes(query)
    );
  }
  return c.json({
    count: clubs.length,
    clubs: clubs,
  });
});

api.get('/events', (c) => {
  return c.json({
    count: EVENTS_DATA.length,
    events: EVENTS_DATA,
  });
});

api.post('/sort/session', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const userId = body.user_id || 'reddit_user';
    const { sessionId, firstQuestion } = createSession(userId);

    return c.json({
      session_id: sessionId,
      question: {
        id: firstQuestion.id,
        code: firstQuestion.code,
        text: firstQuestion.text,
        options: firstQuestion.options.map((o) => ({ id: o.id, text: o.text })),
      },
    });
  } catch (err) {
    console.error('Create session error:', err);
    return c.json({ error: 'Failed to initialize quiz session' }, 500);
  }
});

api.post('/sort/answer', async (c) => {
  try {
    const body = await c.req.json();
    const sessionId = body.session_id;
    const questionId = Number(body.question_id);
    const optionId = Number(body.option_id);

    const result = submitAnswer(sessionId, questionId, optionId);

    if (result.completed) {
      return c.json({
        completed: true,
        recommendations: result.recommendations,
      });
    }

    const nextQ = result.nextQuestion!;
    return c.json({
      completed: false,
      session_id: sessionId,
      question: {
        id: nextQ.id,
        code: nextQ.code,
        text: nextQ.text,
        options: nextQ.options.map((o) => ({ id: o.id, text: o.text })),
      },
    });
  } catch (err) {
    console.error('Submit answer error:', err);
    return c.json({ error: 'Failed to process answer' }, 500);
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

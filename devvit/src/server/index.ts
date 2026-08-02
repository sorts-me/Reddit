import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { context, createServer, getServerPort, reddit } from '@devvit/web/server';

const app = new Hono();
const internal = new Hono();

// Trigger: AppInstall
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

// Trigger: AppUpgrade
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

// Menu Item: Create Sortling Campus Guide Post
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

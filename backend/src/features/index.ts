import { Express } from 'express';
import { API_ROUTES } from 'shared';
import { authRouter } from './auth';
import { tasksRouter } from './tasks';

/**
 * Feature Registry
 * When adding a new feature:
 * 1. Create your folder under `src/features/<your-feature>`
 * 2. Mount your router here with its API prefix
 * 
 * This isolates individual feature development and prevents git merge conflicts
 * in route configuration across teams.
 */
export const registerFeatures = (app: Express): void => {
  app.use(API_ROUTES.AUTH.ROOT, authRouter);
  app.use(API_ROUTES.TASKS.ROOT, tasksRouter);

  // Future features are mounted cleanly:
  // app.use(API_ROUTES.USERS.ROOT, usersRouter);
  // app.use('/api/v1/projects', projectsRouter);
};

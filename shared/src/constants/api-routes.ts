export const API_ROUTES = {
  AUTH: {
    ROOT: '/api/v1/auth',
    LOGIN: '/login',
    REGISTER: '/register',
    ME: '/me',
  },
  USERS: {
    ROOT: '/api/v1/users',
    BY_ID: '/:id',
  },
  TASKS: {
    ROOT: '/api/v1/tasks',
    BY_ID: '/:id',
    STATUS: '/:id/status',
  },
} as const;

import dva from '../lib/index';

const app = dva();

export const connect = app.connect;
export const model = app.model;

export default app;


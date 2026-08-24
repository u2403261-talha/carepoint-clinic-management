import serverless from 'serverless-http';
import express from 'express';
import { app } from '../../server.ts';

const wrapper = express();

// Change from '/.netlify/functions/api' to a wildcard root fallback
wrapper.use('*', app);

export const handler = serverless(wrapper);


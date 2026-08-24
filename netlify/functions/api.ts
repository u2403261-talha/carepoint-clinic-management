import serverless from 'serverless-http';
import express from 'express';
import { app } from '../../server.ts';

const wrapper = express();
wrapper.use('/.netlify/functions/api', app);

export const handler = serverless(wrapper);

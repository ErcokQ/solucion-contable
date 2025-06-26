import { Router } from "express";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'node:path';

const spec = YAML.load(
   path.join(__dirname, '..', '..', 'docs/openapi/openapi_v2.yaml')
);

export const docsRouter = Router();
docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
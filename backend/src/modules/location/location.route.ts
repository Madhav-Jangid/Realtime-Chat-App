import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as locationController from './location.controller';

export const locationRouter = Router();

locationRouter.use(authMiddleware);
locationRouter.patch('/', asyncHandler(locationController.updateLocation));

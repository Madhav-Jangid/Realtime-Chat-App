import { z } from 'zod';
import { UserModel } from '../../models/User';
import { AppError } from '../../utils/AppError';

const locationSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90)
});

export async function updateLocation(userId: string, payload: unknown) {
  const data = locationSchema.parse(payload);
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      location: { type: 'Point', coordinates: [data.longitude, data.latitude] },
      lastActive: new Date()
    },
    { new: true }
  ).select('location lastActive');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

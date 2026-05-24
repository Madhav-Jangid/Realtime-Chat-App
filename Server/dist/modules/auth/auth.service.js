import { User } from '../../models/user.model.js';
import { generateToken } from '../../middleware/auth.js';
import { AppError } from '../../utils/app-error.js';
export async function signup(data) {
    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email: data.email }, { username: data.username }],
    });
    if (existingUser) {
        throw new AppError('User already exists', 400);
    }
    // Create new user
    const user = new User(data);
    await user.save();
    const token = generateToken(user._id.toString());
    return {
        user: {
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
        },
        token,
    };
}
export async function login(data) {
    // Find user and include password field
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }
    // Compare passwords
    const isValid = await user.comparePassword(data.password);
    if (!isValid) {
        throw new AppError('Invalid credentials', 401);
    }
    const token = generateToken(user._id.toString());
    // Update last active
    user.lastActive = new Date();
    await user.save();
    return {
        user: {
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
        },
        token,
    };
}

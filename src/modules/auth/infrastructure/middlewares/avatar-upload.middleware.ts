import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { ApiError } from '@shared/error/ApiError';

const MAX_MB = 2;
const MAX_SIZE = MAX_MB * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads', 'avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = req.userId ?? 'anon';
    const name = `${id}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new ApiError(400, 'INVALID_AVATAR_TYPE'));
  }
  cb(null, true);
}

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

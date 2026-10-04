// Cloudinary is optional, but its three settings go together
const CLOUDINARY_VARS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];
const CLOUDINARY_CLOUD_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
// A folder path such as app/avatars: letters, digits, _ and -, parts separated by one slash
const CLOUDINARY_FOLDER_PATTERN = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/;

const present = (config: Record<string, unknown>, name: string) =>
  typeof config[name] === 'string' && (config[name] as string).trim() !== '';

/** Image storage is optional; when any setting is given, all three are needed and must look right. */
export function validateStorageEnv(
  config: Record<string, unknown>,
  errors: string[],
): void {
  const given = CLOUDINARY_VARS.filter((name) => present(config, name));

  if (given.length > 0 && given.length < CLOUDINARY_VARS.length) {
    const missing = CLOUDINARY_VARS.filter((name) => !present(config, name));
    errors.push(
      `${CLOUDINARY_VARS.join(', ')} must all be set together, or none of them (missing: ${missing.join(', ')})`,
    );
  } else if (
    present(config, 'CLOUDINARY_CLOUD_NAME') &&
    !CLOUDINARY_CLOUD_NAME_PATTERN.test(
      (config.CLOUDINARY_CLOUD_NAME as string).trim(),
    )
  ) {
    errors.push('CLOUDINARY_CLOUD_NAME may only contain letters, digits, _ and -');
  }

  if (
    present(config, 'CLOUDINARY_FOLDER') &&
    !CLOUDINARY_FOLDER_PATTERN.test((config.CLOUDINARY_FOLDER as string).trim())
  ) {
    errors.push(
      'CLOUDINARY_FOLDER must look like app/avatars: letters, digits, _ and -, separated by single slashes',
    );
  }
}

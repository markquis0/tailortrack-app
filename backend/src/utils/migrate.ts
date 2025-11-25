import { execSync } from 'child_process';

/**
 * Runs database migrations before starting the server
 * This ensures the database schema is up to date
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Checking database migrations...');

    // Validate DATABASE_URL before proceeding
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
      // Show first part of URL for debugging (without exposing password)
      const urlPreview = databaseUrl.substring(0, 20) + '...';
      throw new Error(
        `DATABASE_URL must start with 'postgresql://' or 'postgres://'. ` +
        `Current value starts with: ${urlPreview}. ` +
        `Please check your DATABASE_URL environment variable.`
      );
    }

    // Generate Prisma Client first (in case it's not generated)
    try {
      console.log('📦 Ensuring Prisma Client is generated...');
      execSync('npx prisma generate', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });
    } catch (error) {
      // If generate fails, it might already be generated, continue
      console.log('ℹ️  Prisma Client generation skipped (may already exist)');
    }

    // Run migrations
    // Use 'deploy' for production (applies pending migrations without prompts)
    // Use 'dev' for development (can create new migrations)
    // This is safe for production environments like Render
    const isProduction = process.env.NODE_ENV === 'production';
    const migrateSubcommand = isProduction ? 'deploy' : 'dev';

    console.log(`🚀 Running migrations (${isProduction ? 'production' : 'development'} mode)...`);
    
    // For production, temporarily unset SHADOW_DATABASE_URL if it exists
    // migrate deploy doesn't need a shadow database
    const env = { ...process.env };
    if (isProduction && env.SHADOW_DATABASE_URL) {
      delete env.SHADOW_DATABASE_URL;
    }
    
    try {
      execSync(`npx prisma migrate ${migrateSubcommand}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: env,
      });
      console.log('✅ Database migrations completed successfully');
    } catch (migrationError) {
      // In production, fail if migrations fail
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Migration failed in production - server will not start');
        throw migrationError;
      } else {
        // In development, log warning but continue
        console.warn('⚠️  Migration warning (development mode):', migrationError);
        console.warn('⚠️  Continuing despite migration error - migrations may already be applied');
      }
    }
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

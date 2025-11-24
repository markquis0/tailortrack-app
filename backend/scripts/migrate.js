"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function runMigrations() {
    try {
        console.log('🔄 Running database migrations...');
        // Generate Prisma Client first
        console.log('📦 Generating Prisma Client...');
        (0, child_process_1.execSync)('npx prisma generate', { stdio: 'inherit' });
        // Run migrations
        // Use 'migrate deploy' for production (applies pending migrations)
        // Use 'migrate dev' for development (creates new migrations)
        const isProduction = process.env.NODE_ENV === 'production';
        const migrateCommand = isProduction ? 'migrate deploy' : 'migrate dev';
        console.log(`🚀 Running migrations (${isProduction ? 'production' : 'development'} mode)...`);
        (0, child_process_1.execSync)(`npx prisma migrate ${migrateCommand}`, { stdio: 'inherit' });
        console.log('✅ Database migrations completed successfully');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
runMigrations()
    .then(() => {
    console.log('✨ Migration script completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map
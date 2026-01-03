const scripts = {
  // Database scripts
  'db:generate': 'prisma generate',
  'db:push': 'prisma db push',
  'db:migrate': 'prisma migrate dev',
  'db:migrate:deploy': 'prisma migrate deploy',
  'db:migrate:reset': 'prisma migrate reset',
  'db:studio': 'prisma studio',
  'db:seed': 'ts-node prisma/seed.ts',

  // Development
  'dev:full': 'npm run db:generate && npm run dev',

  // Production
  'build:full': 'npm run db:generate && npm run build',
  'start:prod': 'npm run db:migrate:deploy && npm start',
}

module.exports = scripts

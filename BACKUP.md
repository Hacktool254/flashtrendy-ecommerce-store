# Backup & Recovery Strategy - FlashTrendy

Ensuring data durability and business continuity through automated backups and manual recovery procedures.

## 1. Database Backups (Neon PostgreSQL)
FlashTrendy uses **Neon** for PostgreSQL, which provides native Point-in-Time Recovery (PITR) and snapshots.

### Automated Backups:
- **Daily Snapshots**: Neon automatically takes daily snapshots of your database.
- **PITR**: You can restore your database to any point in time within the last 30 days.

### Manual Export:
To perform a manual backup of the entire database:
```bash
# Export schema and data
pg_dump $DATABASE_URL > backup_$(date +%F).sql
```

## 2. File & Image Backups (Uploadthing)
All product images and user avatars are stored on **Uploadthing**.

### Strategy:
- **Cloud Resiliency**: Uploadthing uses AWS S3 with high durability (99.999999999%).
- **Manual Mirroring**: For critical assets, manually download the `public` uploads periodically or sync to a cold storage S3 bucket.

## 3. Configuration & Code Backups (GitHub)
- **Version Control**: GitHub maintains the full history of the application code.
- **Secrets Management**: Environment variables should be backed up in a secure password manager (e.g., 1Password or Bitwarden) as they are NOT stored in the repository.

## 4. Recovery Procedure
In the event of a catastrophic failure:

1.  **Code**: Re-deploy the latest stable branch from GitHub to Vercel.
2.  **Database**: 
    - Go to the Neon Dashboard -> Backups.
    - Select a snapshot or point in time.
    - Click "Restore" to a new branch or the main branch.
3.  **Secrets**: Re-populate Vercel environment variables from your secure backup.
4.  **Verification**: Run the [Smoke Test Suite](file:///c:/Users/pc/OneDrive/Desktop/flashtrendy%20ecommerce%20store/cypress/e2e/smoke.cy.ts) to ensure core flows are restored.

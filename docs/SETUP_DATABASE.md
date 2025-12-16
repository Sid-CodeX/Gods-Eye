# 💾 Gods-Eye Database Setup Guide

This document provides the mandatory steps for setting up and verifying the local SQLite development database for the Gods-Eye backend.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Database Creation](#3-database-creation)
4. [Security & Git Commit Rules](#4-security--git-commit-rules)

---

## 1. Prerequisites

### Tools Required

Ensure the **SQLite Command Line Interface (CLI)** is installed and accessible via your terminal.

| OS | Installation Hint | Verification Command |
| :--- | :--- | :--- |
| macOS/Linux | Often pre-installed. Use `brew install sqlite` if needed. | `sqlite3 --version` |
| Windows | Download tools ZIP, extract `sqlite3.exe`, and add its folder path (e.g., `C:\sqlite`) to your System PATH. | `sqlite3 --version` |

### Security Rationale

- **Goal:** Create a reproducible, isolated local database (`store.db`) from `backend/db/schema.sql`.
- **Rule:** Database files (`store.db`) contain sensitive encrypted data and **must never be committed** to the repository.

---

## 2. Project Structure

The relevant structure for the database setup is as follows:

```
Gods-Eye/
├── backend/
│   ├── data/       # Local runtime database files (e.g., store.db). DO NOT COMMIT.
│   └── db/         # Database schema files (e.g., schema.sql). COMMIT.
└── docs/
    └── SETUP_DATABASE.md   # This document.
```

---

## 3. Database Creation

### 3.1 Prepare Environment

Create the data directory and navigate to the backend folder:

```bash
mkdir -p backend/data
cd backend
```

### 3.2 Apply the Schema

Open the SQLite shell, creating the `store.db` file inside `backend/data`:

**Windows Example:**
```powershell
# Use full path if SQLite is not in PATH
C:\Users\<username>\sqlite\sqlite3.exe data/store.db

# Or if sqlite3 is in your PATH
sqlite3 data/store.db
```

**macOS/Linux Example:**
```bash
sqlite3 data/store.db
```

Inside the SQLite shell, run the following commands to apply the schema and verify table creation:

```sql
.read db/schema.sql
.tables
.exit
```

**Expected output for `.tables`:** `cases messages`

---

## 4. Security & Git Commit Rules

The following rules are mandatory for all development and commits:

| Rule | Action | Rationale |
| :--- | :--- | :--- |
| **Database File** | **DO NOT commit** `backend/data/store.db`. | Prevents data leakage and ensures isolated, reproducible local setups. |
| **Schema File** | **COMMIT** `backend/db/schema.sql`. | Maintains consistent, version-controlled structure across all environments. |
| **Data Handling** | Treat `ciphertext` column as an **opaque BLOB**. | Enforces the encryption-first principle; the backend should never attempt to decode this data. |

### Git Configuration

Ensure your `.gitignore` file includes:

```gitignore
# Database files
backend/data/*.db
backend/data/*.db-journal
backend/data/*.db-wal
backend/data/*.db-shm
```

---

## Verification Checklist

After completing the setup, verify the following:

- [ ] SQLite CLI is installed and accessible (`sqlite3 --version` works)
- [ ] `backend/data/` directory exists
- [ ] `backend/data/store.db` file exists
- [ ] Database contains expected tables (`cases` and `messages`)
- [ ] `.gitignore` excludes database files
- [ ] `backend/db/schema.sql` is committed to version control

---

## Troubleshooting

### SQLite Command Not Found

**Windows:**
1. Download SQLite from [sqlite.org](https://www.sqlite.org/download.html)
2. Extract `sqlite3.exe` to a folder (e.g., `C:\sqlite`)
3. Add the folder to your System PATH environment variable
4. Restart your terminal

**macOS:**
```bash
brew install sqlite
```

**Linux:**
```bash
sudo apt-get install sqlite3  # Debian/Ubuntu
sudo yum install sqlite        # CentOS/RHEL
```

### Schema File Not Found

Ensure you're running the SQLite commands from the `backend/` directory, and that `db/schema.sql` exists in that location.

### Permission Errors

On Unix-like systems, ensure you have write permissions for the `backend/data/` directory:

```bash
chmod 755 backend/data
```

---

## Additional Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite Command Line Shell](https://www.sqlite.org/cli.html)


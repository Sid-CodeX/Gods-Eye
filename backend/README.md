# Gods-Eye Backend Setup

This document outlines the setup procedure for the Gods-Eye backend, focusing on a secure, reproducible local development environment.

## 1. Prerequisites (Tools)

The following must be installed before starting:

* **Node.js & npm** (We will use this in Phase 2)
* **SQLite CLI:** The command-line utility for SQLite.

### SQLite CLI Installation (Windows)

Gods-Eye uses a local SQLite database that must be set up correctly to handle encrypted blobs.

1.  **Download:** Download the `sqlite-tools-win-x64-*.zip` (Command-line tools) from the official SQLite website.
2.  **Extract:** Extract `sqlite3.exe` (and supporting files) to a dedicated folder, e.g., `C:\sqlite`.
3.  **PATH:** Add the folder path (`C:\sqlite`) to your Windows System PATH environment variable.
4.  **Verify:** Open a **new** terminal and run `sqlite3 --version`.

---

## 2. Folder Structure

The backend relies on this structure for separation of schema and runtime data:
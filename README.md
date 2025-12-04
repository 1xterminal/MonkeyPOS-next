# MonkeyPOS-next

A modern Point of Sale (POS) application built with **Next.js 16**, **TypeScript**, and **Prisma**.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Bootstrap 5](https://getbootstrap.com/) & CSS Modules
- **Authentication**: Custom implementation (using `jose` & `bcryptjs`)

## 📂 Project Structure

- **`app/`**: Main application routes and logic.
  - **`(app)/`**: Authenticated application routes (e.g., Dashboard).
  - **`(auth)/`**: Authentication routes (e.g., Login).
  - **`api/`**: Backend API endpoints.
  - **`layout.tsx`**: Root layout component.
  - **`globals.css`**: Global styles and Bootstrap imports.
- **`components/`**: Reusable React components.
  - **`ui/`**: Core UI building blocks (Buttons, Inputs, etc.).
- **`prisma/`**: Database schema and seed scripts.
- **`lib/`**: Shared utilities and helpers.

## 🚀 Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Development Guide

### How to Create a New Page

In Next.js App Router, **folders define routes**.

#### 1. Choose the Location
- **Public Page**: Create a folder directly in `app/` (e.g., `app/about`).
- **App Page**: Create a folder inside `app/(app)/` (e.g., `app/(app)/settings`).

#### 2. Create the File
Create a `page.tsx` file inside your new folder.

**Example: Creating a Settings Page**
File path: `app/(app)/settings/page.tsx`

```tsx
import React from 'react';
import Button from '@/app/components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="container mt-4">
      <h1>Settings</h1>
      <p className="text-muted">Manage your application preferences.</p>
      
      <div className="card p-4 shadow-sm">
        {/* Page Content */}
        <div className="mb-3">
            <label className="form-label">Username</label>
            <input type="text" className="form-control" />
        </div>
        <Button variant="primary">Save</Button>
      </div>
    </div>
  );
}
```

### Styling
- **Global Styles**: Defined in `app/globals.css`.
- **Bootstrap**: Standard Bootstrap classes (e.g., `container`, `btn`, `d-flex`) work out of the box.
- **Custom Component Styles**: Use CSS Modules (e.g., `Button.module.css`) for component-specific styling to avoid conflicts.

# Corridor LMS — MGS Web3 Creatives

**Turning it in is a push.**

Corridor is a learning management system for **cohort-based technical programs** — fixed start, fixed end, everyone moving through the same schedule together. It is built on the premise that for technical programs, learners should work in teams on shared tasks, and turning work in *is* pushing to a branch.

This repository contains the monorepo for the Corridor LMS platform.

## Features (Admin Panel — Part 12)

The current implementation includes a fully functional Admin Panel (`apps/web/app/admin`) that handles platform management:

- **User Management**: Active/suspended states, role editing, suspension with session revocation, and bulk invites.
- **Tutor Management**: Reassign instructors across cohorts while preserving historical data.
- **Course Approval**: Manage course progression from Draft → In Review → Published/Rejected.
- **Platform Analytics**: Cross-cohort views, completion trends, and system health metrics.
- **AI Agent Configuration**: Manage 9 specialized agents (Manager, Review, Progress coach, Tutor, Content, Quiz, Recommendation, Instructor assistant, Admin agent) and their autonomy levels.
- **Reporting**: Export platform state data (rosters, contributions, certificates) to CSV or PDF instantly.
- **Content Moderation**: Review and action flagged discussion posts and AI-flagged submissions, with full audit logging.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS v4 (Design tokens matching `PRODUCT-DIRECTION.md`)
- **Language**: TypeScript

## Project Structure

```text
.
├── apps/
│   └── web/                 # Next.js application (Frontend & Admin Panel)
├── packages/
│   └── types/               # Shared TypeScript interfaces across the monorepo
└── PRODUCT-DIRECTION.md     # Core product thesis and design system
```

## Getting Started

1. **Install Dependencies** (from the root or app folder):
   *(Note: Workspaces are being configured, currently dependencies are mainly in `apps/web`)*
   ```bash
   cd apps/web
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   cd apps/web
   npm run dev
   ```

3. **Open the App**:
   Visit [http://localhost:3000/admin](http://localhost:3000/admin) in your browser to view the Admin Panel.

## Design System

The platform strictly adheres to the visual system defined in the Product Direction document:
- **8 Color Tokens**: Strict palette usage (Ink, Chalk, Signal, Mark, etc.).
- **Typography**: `Bricolage Grotesque` (Headings), `IBM Plex Sans` (Body), `IBM Plex Mono` (Data/Code).
- **Motion**: Purposeful `.rise` entrance animations and `.pulse` indicators.

## License

All rights reserved — MGS Web3 Creatives.

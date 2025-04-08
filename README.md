# AIToolKit.space

A curated, SEO-optimized directory of AI tools and platforms across categories like text generation, image creation, audio processing, video editing, and more.

## Project Overview

AIToolKit.space is a full-stack web application that provides users with a curated directory of AI tools and platforms. The website features a clean, modern UI with comprehensive information about each tool, including features, pricing, and user ratings.

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Firebase Firestore
- **Auth**: Firebase Authentication (Google, GitHub) with domain-restricted admin access
- **Storage**: Firebase Storage
- **Search**: Client-side with Fuse.js
- **Hosting**: Vercel
- **CMS**: Custom admin panel built in Next.js (/admin), protected by Firebase Auth
- **SEO**: Full optimization with dynamic metadata and schema.org
- **Monetization**: Affiliate links, sponsored listings, and Google AdSense

## Features

- Comprehensive AI tool listings with detailed information
- Category-based browsing and filtering
- Real-time tool listing with Firestore snapshot
- Client-side search with Fuse.js
- Blog section with SEO-optimized content
- Admin panel for content management
- User authentication with Google and GitHub
- Role-based access control
- Feedback and reporting system

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin panel routes
│   ├── blog/               # Blog routes
│   ├── tools/              # Tool listing routes
│   ├── contact/            # Contact page
│   ├── about/              # About page
│   ├── page.tsx            # Homepage
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── admin/              # Admin panel components
│   ├── layout/             # Layout components (Navbar, Footer)
│   ├── tools/              # Tool listing components
│   ├── blog/               # Blog components
│   └── auth/               # Authentication components
└── lib/                    # Utility functions and services
    ├── firebase.ts         # Firebase configuration
    ├── AuthContext.tsx     # Authentication context provider
    ├── models.ts           # TypeScript interfaces
    └── firebase-services.ts # Firebase service functions
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Firebase account with Firestore, Authentication, and Storage enabled

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/aitoolkit.git
   cd aitoolkit
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Firebase credentials
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add the environment variables in the Vercel project settings
3. Deploy your application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Firebase](https://firebase.google.com/)
- [Vercel](https://vercel.com/)

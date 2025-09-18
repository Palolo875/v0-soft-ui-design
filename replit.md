# BrainBloom - Digital Garden of Ideas

## Project Overview
BrainBloom is a beautiful note-taking application with organic design and fluid interactions. This is a Next.js React application that serves as a digital garden for users to cultivate thoughts, connect concepts, and watch their knowledge bloom.

## Core Technology Stack
- **Frontend Framework**: Next.js 14.2.16 (React 18)
- **Styling**: Tailwind CSS 4.1.9 with custom color palette
- **UI Components**: Radix UI components for accessibility
- **Typography**: Lexend (sans), Lora (serif), Geist Mono
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics
- **Development**: TypeScript with ESNext

## Project Architecture

### Key Features
- **Multi-view Interface**: Home, Notes, Rich Text Editor, Graph Visualization, Modules, Settings
- **Responsive Design**: Mobile-first approach with soft UI design system
- **Custom Components**: Soft UI cards, animated search, floating orb menu
- **Rich Text Editing**: Built-in rich text editor for notes
- **Graph Visualization**: Visual representation of note connections
- **Theme System**: Custom accent colors (peach, lavender, honey, green)

### Directory Structure
- `app/` - Next.js 13+ app directory with layout and pages
- `components/` - Reusable React components including UI kit
- `components/ui/` - Base UI components (buttons, inputs, etc.)
- `hooks/` - Custom React hooks (e.g., use-notes.ts)
- `lib/` - Utility functions
- `public/` - Static assets including illustration images
- `styles/` - Global CSS styles

## Replit Environment Setup

### Development Configuration
- **Port**: 5000 (configured for Replit environment)
- **Host**: 0.0.0.0 (allows external access through Replit proxy)
- **Cache Headers**: Configured to prevent caching issues in iframe environment
- **Build Optimizations**: TypeScript and ESLint errors ignored during builds for development speed

### Current Status
✅ **Project Successfully Imported and Configured**
- Dependencies installed via npm
- Tailwind CSS configuration created with custom theme
- Next.js configuration optimized for Replit environment
- Development server running on port 5000
- All major components and features functional

### Development Workflow
- **Start Development**: `npm run dev` (configured to run on 0.0.0.0:5000)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Deployment**: Configured for autoscale deployment target

## User Preferences
- **Language**: Mixed English/French interface (some French text in empty states)
- **Design Philosophy**: Soft UI, organic design with nature-inspired illustrations
- **Color Scheme**: Pastel accent colors with modern typography

## Recent Changes (September 18, 2025)
- Successfully imported from GitHub repository
- Created missing Tailwind CSS configuration with custom color palette
- Configured Next.js for Replit environment compatibility
- Set up development workflow with proper host and port configuration
- Added cache control headers to prevent iframe caching issues
- Verified all components and features are working correctly
- Configured deployment settings for production autoscaling

## Development Notes
- The application uses a single-page architecture with view state management
- Features a floating orb menu for navigation between different app sections
- Includes empty state illustrations to guide new users
- Ready for production deployment with current configuration
# AI Game Generator

This project is an AI-powered game generator platform that allows users to create 3D games by providing natural language prompts.

## Project Setup

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn
- Unity (optional, for actual game building)

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/aigamegenerator
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
BUILDS_DIR=./builds
BUILDS_URL=http://localhost:5000/builds
```

Create a `.env.local` file in the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_change_this_in_production
```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Initialize the database with templates:
   ```
   node init.js
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

### Backend

- `models/` - MongoDB schemas
- `controllers/` - Request handlers
- `routes/` - API endpoints
- `services/` - Business logic
- `utils/` - Utility functions
- `middleware/` - Express middleware

### Frontend

- `app/` - Next.js app directory
- `components/` - React components
- `lib/` - Utility functions
- `types/` - TypeScript type definitions

## Game Creation Flow

1. User enters a prompt describing the game they want to create
2. Backend processes the prompt to generate a game design document
3. System selects appropriate templates and assets
4. Unity build is generated (or mocked in development)
5. WebGL preview is provided to the user

## Implementation Details

### Authentication

- JWT-based authentication via NextAuth.js
- Protected routes for authenticated users

### Game Generation

- Prompt analysis using AI (mock implementation for now)
- Template selection based on game type
- Asset selection/generation
- Unity build creation

### Unity Integration

Currently using a mock implementation that creates sample WebGL files for preview. In a production environment, this would be integrated with:

1. Unity CLI for automated builds
2. Asset generation or selection from a library
3. Script generation based on the game design

## Next Steps

1. **Implement AI Integration**: Integrate with AI services (like OpenAI) to properly analyze user prompts
2. **Asset Generation**: Develop a system for generating or selecting appropriate game assets
3. **Unity Build Pipeline**: Set up actual Unity build process instead of mocks
4. **Improved WebGL Player**: Enhance the Unity WebGL player integration
5. **Game Customization**: Add the ability for users to customize their games after generation
6. **Version Control**: Implement proper versioning for game projects

## Development Notes

- The current implementation uses mock data for game generation
- WebGL builds are simulated for development purposes
- User authentication and project management are fully functional
- Frontend and backend communication is established

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request
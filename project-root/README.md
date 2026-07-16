# Project Root

This repository contains the full-stack application:
- client/ - React frontend
- server/ - FastAPI backend

The dashboard follows the shared application structure:
- `client/src/pages/Dashboard.js` is the route-level page.
- `client/src/features/dashboard/` contains dashboard components, hooks, and services.
- Dashboard data is loaded through the shared authenticated API client from the application database.
# project root navigation 
cd project-root
# Start the server:
cd server
python -m src.main

# Start the client:
cd client
npm start

@echo off
SET DISABLE_ESLINT_PLUGIN=true
SET ESLINT_NO_DEV_ERRORS=true
SET REACT_APP_AUTH_SERVICE_URL=http://localhost:8081/api/auth
npx react-scripts start 
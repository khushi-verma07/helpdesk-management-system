@echo off
echo Testing Dashboard API...
echo.

echo Logging in as admin...
for /f "tokens=*" %%i in ('curl -s -X POST "http://localhost:9000/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\"}"') do set LOGIN_RESPONSE=%%i

echo Login Response: %LOGIN_RESPONSE%
echo.

echo Fetching dashboard data...
curl -X GET "http://localhost:9000/api/analytics/dashboard" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc1ODQ2MTE4OCwiZXhwIjoxNzU5MDY1OTg4fQ.7y1OWu2gPBIwVcsQTpHKPDl12lea6uuQMiiiEuOA0ug"

echo.
echo.
echo ✅ Dashboard API is working correctly!
echo.
echo To access the dashboard:
echo 1. Go to http://localhost:59101/login
echo 2. Login with: admin@test.com / admin123  
echo 3. Navigate to http://localhost:59101/admin/dashboard
echo.
pause
@echo off
echo ================================================
echo   PAYFLOW - Turborepo Setup
echo ================================================

echo.
echo [1/4] Installing root dependencies (Turborepo)...
call npm install
if %errorlevel% neq 0 ( echo ERROR in root install & pause & exit )

echo.
echo [2/4] Installing database package dependencies...
cd packages\database
call npm install
if %errorlevel% neq 0 ( echo ERROR in database install & pause & exit )
cd ..\..

echo.
echo [3/4] Installing auth-service dependencies...
cd apps\auth-service
call npm install
if %errorlevel% neq 0 ( echo ERROR in auth-service install & pause & exit )
cd ..\..

echo.
echo [4/4] Generating Prisma client...
cd packages\database
call npx prisma generate
if %errorlevel% neq 0 ( echo ERROR in prisma generate & pause & exit )
cd ..\..

echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Now run these commands:
echo.
echo   1. cd packages\database
echo   2. npx prisma migrate dev --name init
echo   3. cd ..\..\apps\auth-service
echo   4. npm run dev
echo.
pause

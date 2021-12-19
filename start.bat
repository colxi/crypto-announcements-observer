@echo off
if exist node_modules\ (
  CALL yarn start
) else (
  echo Initializing dependencies...
  CALL yarn
  CALL yarn start
)
echo Press enter to exit...
pause >nul
exit
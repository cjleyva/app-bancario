@echo off
echo Iniciando MongoDB como Replica Set...
"D:\Users\Cafel\Documents\MongoDB\mongodb-windows-x86_64-8.0.5\mongodb-win32-x86_64-windows-8.0.5\bin\mongod.exe" --dbpath "C:\data\db" --replSet rs0
pause

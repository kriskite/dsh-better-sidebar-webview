@echo off
rem dsh-better-sidebar 桌面内嵌浏览器补丁工具（双击运行）
rem 功能：自动定位 DSH Desktop -> 开启 webviewTag + 放行 attach + 修复导航守卫
rem 已打补丁会幂等跳过；支持 --check 检测、--restore 回滚。
chcp 65001 >nul
setlocal

rem 优先用 DSH 自带的 node，找不到则用 PATH 里的 node
set "NODE_CMD="
if exist "%~dp0..\..\node_modules\\.bin\\node.exe" set "NODE_CMD=%~dp0..\..\node_modules\\.bin\\node.exe"
if not defined NODE_CMD if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_CMD=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined NODE_CMD set "NODE_CMD=node"

"%NODE_CMD%" "%~dp0patch-desktop.js" %*
set "EXIT=%ERRORLEVEL%"

echo.
if "%EXIT%"=="0" (echo [OK] 完成。如已打补丁，请完全退出 DSH Desktop（含托盘）后重启生效。) else (echo [失败] 详见上方输出，可用 --desktop-dir "路径" 指定桌面安装目录。)
pause
exit /b %EXIT%

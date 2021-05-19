# Development

## Requirements

- nodejs v14.16.1 (npm v6.14.12)
- Python 3.8 (for window 7 not support Python 3.9) & vertualenv

1. Install node packages

```bash
$ npm install
```

2. Install Python environment
```bash
# 2-1. Install virtualenv
$ cd py-script
$ python install virtualenv
$ virtualenv venv

# 2-2. activate python in virtual environment
# Windows (Powershell)
$ .\venv\Scripts\activate.ps1
# macOS/unix-like
$ source ./venv/bin/activate

# 2-3. install python package
$ pip install -r
```

## Usage

run react dev server & electron in development mode
```bash
$ npm run dev:react
# different terminal
$ npm run dev:electron
```

# Build

```bash
$ npm run packager
```

# react structure

- app -> App -> MainPage (AppBar & Tabs)
  - FolderContainer (Grid)
    - FolderMenu, FolderNodeList, FolderBreadcrumb
# camera-trap-desktop


# data struct

SQLite save timestamp (+8 timezone)

server save UTC


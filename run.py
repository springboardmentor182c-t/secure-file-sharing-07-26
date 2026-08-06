import sys
import os
import subprocess
import importlib.util

def check_package(package_name):
    """Checks if a python package is installed."""
    return importlib.util.find_spec(package_name) is not None

def check_and_install_dependencies():
    """Validates required dependencies and installs them if missing."""
    required = {
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn',
        'multipart': 'python-multipart',
        'PIL': 'Pillow',
        'dotenv': 'python-dotenv'
    }
    
    missing = []
    for module, install_name in required.items():
        if not check_package(module):
            missing.append(install_name)
            
    if missing:
        print("[-] Missing dependencies detected:", ", ".join(missing))
        print("[*] Installing missing dependencies...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])
            print("[+] Dependencies successfully installed!")
        except Exception as e:
            print("[-] Error installing dependencies automatically:", e)
            print("[-] Please run 'pip install -r requirements.txt' manually.")
            sys.exit(1)
    else:
        print("[+] All python dependencies are installed and verified.")

def main():
    print("=" * 70)
    print("   SECURE FILE SHARING SYSTEM - AI DUPLICATE FILE DETECTION ENGINE   ")
    print("                   Infosys Virtual Internship Task                   ")
    print("=" * 70)
    
    # 1. Pre-flight dependency check
    check_and_install_dependencies()
    
    # 2. Add current directory to python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    # 3. Import uvicorn
    try:
        import uvicorn
    except ImportError:
        print("[-] Failed to load uvicorn. Please ensure dependencies are set up.")
        sys.exit(1)
        
    print("\n[*] Starting FastAPI Application Server...")
    print("[*] Application Dashboard URL: http://127.0.0.1:8000")
    print("[*] Press Ctrl+C to terminate the server.\n")
    
    # 4. Start Uvicorn Server
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == "__main__":
    main()

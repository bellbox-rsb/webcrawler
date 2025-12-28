from app import create_app
import os
import signal
import subprocess

def kill_port(port):
    """
    Finds and kills the process using the specified port.
    """
    try:
        # Find process ID (PID) using lsof
        cmd = f"lsof -t -i:{port}"
        pid = subprocess.check_output(cmd, shell=True).decode().strip()
        
        if pid:
            pids = pid.split('\n')
            current_pid = os.getpid()
            parent_pid = os.getppid()
            
            for p in pids:
                if p and int(p) != current_pid and int(p) != parent_pid:
                    print(f"Killing process {p} on port {port}")
                    try:
                        os.kill(int(p), signal.SIGKILL)
                    except ProcessLookupError:
                        pass
            return True
    except subprocess.CalledProcessError:
        # No process found on this port
        return False
    except Exception as e:
        print(f"Error killing process on port {port}: {e}")
        return False

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    kill_port(port)
    app.run(debug=True, port=port)

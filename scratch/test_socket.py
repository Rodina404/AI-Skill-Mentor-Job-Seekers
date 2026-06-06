import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("0.0.0.0", 8004))
    print("Bound to 0.0.0.0:8004")
    s.close()
except Exception as e:
    print(f"Error binding to 0.0.0.0:8004: {e}")

try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 8004))
    print("Bound to 127.0.0.1:8004")
    s.close()
except Exception as e:
    print(f"Error binding to 127.0.0.1:8004: {e}")

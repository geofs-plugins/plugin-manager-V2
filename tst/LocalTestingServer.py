# Local testing server for testing and debugging SkyX V2
# Written In Python 3

from http.server import BaseHTTPRequestHandler, HTTPServer
import os

# HTTPRequestHandler class
class DebugServer_Handler(BaseHTTPRequestHandler):
 
    # GET
    def do_GET(self):
        # Send response status code
        self.send_response(200)
 
        # Send headers
        self.send_header('Content-type','text/html')
        self.end_headers()

        if (self.path == "/hash/"):
            data = "160bdc886647813db6b9115d7414dd597113c958"
            self.wfile.write(bytes(data, "utf8"))
            return
        elif (self.path[:5] == "/src/"):
            requested_file = self.path[5:]
            running_directory = os.getcwd()
            
            # Testing if the script is run from the tst folder
            if( running_directory[-4:] != "\\tst"):
                # BUG : Not detecting correctly
                self.wfile.write(bytes("Not running in correct directory, please run in tst folder", "utf8"))
                return
            
            # Load the rquested file
            requested_file = running_directory[:-4] + "\\src\\" + requested_file
            with open(requested_file, 'r') as f:
                data = ""
                for line in f.readlines():
                    data += line + "\n"
                self.wfile.write(bytes(data, "utf8"))
                return

 
        # Send message back to client
        #message = "Hello world!"
        # Write content as utf-8 data
        #self.wfile.write(bytes(self.path, "utf8"))
        #return
 
def run():
    print('starting server...')
    
    # Server settings
    # Choose port 8080, for port 80, which is normally used for a http server, you need root access
    server_address = ('127.0.0.1', 8081)
    httpd = HTTPServer(server_address, DebugServer_Handler)
    print('running server...')
    httpd.serve_forever()
 
 
run()
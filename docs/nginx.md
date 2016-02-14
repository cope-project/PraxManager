# Nginx Proxy
When NGINX proxies a request, it sends the request to a specified proxied server, 
fetches the response, and sends it back to the client.

## Sample Configuration

    # Define upstream
    upstream prax_manager{
        server 127.0.0.1:3000; # Port of the node.js app (PraxManager)
    }

    # Define http-server configuration
    server {
        listen       80;
        server_name  prax.cope-project.eu;
        root   /opt/prax.cope-project.eu/public;

        access_log  /var/log/nginx/prax.cope-project.eu.access.log  main;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        location / {
            root   /opt/prax.cope-project.eu/public;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;

            proxy_pass http://prax_manager/;
            proxy_redirect off;
        }

        error_page  404              /404.html;
        location = /404.html {
            root   /usr/share/nginx/html;
        }

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }

    }

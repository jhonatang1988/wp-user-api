aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 764927493242.dkr.ecr.us-east-1.amazonaws.com
docker build -t wp-user-api:latest .
docker tag wp-user-api:latest 764927493242.dkr.ecr.us-east-1.amazonaws.com/wp-user-api:latest
docker push 764927493242.dkr.ecr.us-east-1.amazonaws.com/wp-user-api:latest
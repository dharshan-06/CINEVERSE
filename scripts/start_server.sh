#!/bin/bash
cd /home/ec2-user/movie-app/backend
pm2 delete movie-app || true
pm2 start server.js --name "movie-app"

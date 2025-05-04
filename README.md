    
# Hotel Reservation App

Simple DevOps project which uses Docker to run the MongoDB and NodeJS app through which the website can be access

Jenkins to create a Pipeline, which also has the added functionality of using Github webhooks to immediately create a new build whenever anything is committed to the Repository.

Grafana to monitor the instance, with the help of Prometheus and Node Exporter.

Trivy scans the Docker image being built, which is our NodeJS app.


## How to use the NodeJS app directly

Clone the project

```bash
  git clone https://github.com/omprakashbabu/HotelReservation.git
```

Go to the project directory

```bash
  cd HotelReservation
```

Install dependencies

```bash
  npm install
  npm install -g nodemon
```

Start the server

```bash
  nodemon src/index.js
```

To access the website, go to http://localhost:80

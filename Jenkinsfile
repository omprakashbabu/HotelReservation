pipeline {
    agent any

    environment {
        MONGO_URI = "mongodb://mongodb:27017/HotelReservation"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'No tests defined yet — skip for now'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Trivy Security Scan') {
            steps {
                // Run Trivy scan and capture the output in JSON format
                sh '''
                  TRIVY_OUTPUT=$(trivy image --format json hotel-app_hotel-app:latest)
                  echo "$TRIVY_OUTPUT" > trivy_output.json
                '''
                // Archive the JSON output as an artifact
                archiveArtifacts artifacts: 'trivy_output.json'
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }

        failure {
            echo 'Something went wrong. Check the logs.'
        }
    }
}

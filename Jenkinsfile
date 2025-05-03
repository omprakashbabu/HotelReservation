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

        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
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

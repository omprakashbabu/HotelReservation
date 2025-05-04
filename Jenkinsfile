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

        stage('Security Scan with OWASP ZAP') {
            steps {
                sh '''
                docker run --rm -u zap \
                  -v $(pwd):/zap/wrk/:rw \
                  zaproxy/zap-stable zap-baseline.py \
                  -t http://hotel-reservation-app:80 \
                  -g gen.conf -r zap_report.html || true
                '''
            }
        }
        
    }

    post {
        always {
            archiveArtifacts artifacts: 'zap_report.html', fingerprint: true
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Something went wrong. Check the logs.'
        }
    }
}

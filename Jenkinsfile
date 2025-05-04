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
                // Install Trivy if not available
                sh '''
                    if ! command -v trivy > /dev/null; then
                        echo "Installing Trivy..."
                        sudo apt-get update -y
                        sudo apt-get install wget apt-transport-https gnupg lsb-release -y
                        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
                        echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
                        sudo apt-get update -y
                        sudo apt-get install trivy -y
                    fi
                '''

                // Run Trivy scan but don't fail the pipeline
                sh '''
                    echo "Running Trivy scan..."
                    trivy image --format html -o trivy-report.html hotel-reservation-app || true
                '''
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
        always {
            archiveArtifacts artifacts: 'trivy-report.html', onlyIfSuccessful: false
        }

        success {
            echo 'Deployment successful!'
        }

        failure {
            echo 'Something went wrong. Check the logs.'
        }
    }
}

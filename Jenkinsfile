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
                        sudo apt-get install -y wget apt-transport-https gnupg lsb-release
                        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
                        echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
                        sudo apt-get update -y
                        sudo apt-get install -y trivy
                    fi
                '''

                // Run Trivy scan but don't fail the pipeline.  Use JSON format.
                sh '''
                    echo "Running Trivy scan..."
                    trivy image --format json -o trivy-report.json docker.io/library/hotel-app_hotel-app || true
                '''
                // Convert JSON to HTML using a separate tool (if needed)
                script {
                    //  Example using  jq and a simple HTML wrapper (requires jq in the Jenkins agent)
                    def trivyReportJson = readJSON file: 'trivy-report.json'
                    def htmlReport = """
                        <html>
                        <head>
                            <title>Trivy Vulnerability Report</title>
                            <style>
                              body { font-family: Arial, sans-serif; margin: 20px; }
                              h1 { text-align: center; }
                              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                              th { background-color: #f4f4f4; }
                              tr:nth-child(even) {background-color: #f2f2f2;}
                              .high { color: red; }
                              .medium { color: orange; }
                              .low { color: green; }
                            </style>
                        </head>
                        <body>
                            <h1>Trivy Vulnerability Report</h1>
                            <table>
                                <tr>
                                    <th>Vulnerability ID</th>
                                    <th>Severity</th>
                                    <th>Package Name</th>
                                    <th>Installed Version</th>
                                    <th>Fixed Version</th>
                                    <th>Title</th>
                                </tr>
                    """
                    for (def result in trivyReportJson.Results) {
                        if (result.Vulnerabilities) { //check if vulnerabilities exists
                            for (def vulnerability in result.Vulnerabilities) {
                                def severityClass = vulnerability.Severity.toLowerCase() //for css class
                                htmlReport += """
                                    <tr>
                                        <td>${vulnerability.VulnerabilityID}</td>
                                        <td class="${severityClass}">${vulnerability.Severity}</td>
                                        <td>${vulnerability.PkgName}</td>
                                        <td>${vulnerability.InstalledVersion}</td>
                                        <td>${vulnerability.FixedVersion ?: '-'}</td>
                                        <td>${vulnerability.Title}</td>
                                    </tr>
                                """
                            }
                         }
                    }
                    htmlReport += "</table></body></html>"
                    writeFile file: 'trivy-report.html', text: htmlReport
                }
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

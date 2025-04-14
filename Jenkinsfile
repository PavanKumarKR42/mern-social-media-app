pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/PavanKumarKR42/mern-social-media-app.git', branch: 'main'
            }
        }

        stage('Load Environment Variables from Secrets') {
            steps {
                script {
                    // Retrieve the credentials stored in Jenkins and split them into environment variables
                    def secretEnvVars = credentials('my-env-vars')
                    
                    def envVars = secretEnvVars.split('\n')
                    envVars.each { line ->
                        if (line.trim()) {
                            def (key, value) = line.split('=')
                            if (key && value) {
                                // Set each environment variable dynamically for Docker Compose
                                env[key.trim()] = value.trim()
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Run Containers') {
            steps {
                script {
                    // Run docker-compose with the environment variables loaded
                    bat 'docker-compose down'
                    bat 'docker-compose up --build -d'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up unused Docker resources...'
            bat 'docker system prune -f'
        }
    }
}

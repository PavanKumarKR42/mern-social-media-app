pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        MONGO_URI = credentials('MONGO_URI')
        JWT_SECRET = credentials('JWT_SECRET')
        USE_CLOUDINARY = credentials('USE_CLOUDINARY')
        CLOUDINARY_CLOUD_NAME = credentials('CLOUDINARY_CLOUD_NAME')
        CLOUDINARY_API_KEY = credentials('CLOUDINARY_API_KEY')
        CLOUDINARY_API_SECRET = credentials('CLOUDINARY_API_SECRET')
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/PavanKumarKR42/mern-social-media-app.git', branch: 'main'
            }
        }

        stage('Free Port 5000') {
            steps {
                script {
                    echo 'Checking and stopping any containers using port 5000...'
                    bat '''
                        for /f "tokens=*" %%i in ('docker ps -q --filter "publish=5000"') do (
                            docker stop %%i
                            docker rm %%i
                        )
                    '''
                }
            }
        }

        stage('Build & Run Containers') {
            steps {
                script {
                    bat 'docker-compose down || exit 0'
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

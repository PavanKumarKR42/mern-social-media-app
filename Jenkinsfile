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

        stage('Free Ports 5000 & 3000') {
            steps {
                script {
                    echo 'Stopping any containers using ports 5000 or 3000...'
                    bat '''
                        for %%p in (5000 3000) do (
                            for /f "tokens=*" %%i in ('docker ps -q --filter "publish=%%p"') do (
                                echo Stopping container using port %%p...
                                docker stop %%i
                                docker rm %%i
                            )
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

pipeline {
    agent any

    environment {
        // you only need to map COMPOSE_FILE here—
        // your other secrets (MONGO_URI, JWT_SECRET, etc.)
        // come in automatically from your global env vars.
        COMPOSE_FILE = 'docker-compose.yml'
        
        // (optional) if you want to “expose” them in the pipeline context explicitly:
        MONGO_URI              = "${MONGO_URI}"
        JWT_SECRET             = "${JWT_SECRET}"
        USE_CLOUDINARY         = "${USE_CLOUDINARY}"
        CLOUDINARY_CLOUD_NAME  = "${CLOUDINARY_CLOUD_NAME}"
        CLOUDINARY_API_KEY     = "${CLOUDINARY_API_KEY}"
        CLOUDINARY_API_SECRET  = "${CLOUDINARY_API_SECRET}"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/PavanKumarKR42/mern-social-media-app.git',
                    branch: 'main'
            }
        }

        stage('Free Port 3000') {
            steps {
                script {
                    echo 'Checking and stopping container using port 3000...'
                    sh '''
                    CONTAINER_ID=$(docker ps -q --filter "publish=3000")
                    if [ -n "$CONTAINER_ID" ]; then
                      echo "Stopping container using port 3000..."
                      docker stop $CONTAINER_ID
                      docker rm   $CONTAINER_ID
                    else
                      echo "No container using port 3000."
                    fi
                    '''
                }
            }
        }

        stage('Build & Run Containers') {
            steps {
                script {
                    sh 'docker-compose down || true'
                    sh 'docker-compose up --build -d'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up unused Docker resources...'
            sh 'docker system prune -f'
        }
    }
}

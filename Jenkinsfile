pipeline {
  agent any

  environment {
    COMPOSE_FILE = 'docker-compose.yml'
    MONGO_URI = credentials('mongo-uri') // Use Jenkins credentials for sensitive data
    JWT_SECRET = credentials('jwt-secret')
    USE_CLOUDINARY = credentials('use-cloudinary')
    CLOUDINARY_CLOUD_NAME = credentials('cloudinary-cloud-name')
    CLOUDINARY_API_KEY = credentials('cloudinary-api-key')
    CLOUDINARY_API_SECRET = credentials('cloudinary-api-secret')
  }

  stages {
    stage('Clone Repository') {
      steps {
        git url: 'https://github.com/PavanKumarKR42/mern-social-media-app.git', branch: 'main'
      }
    }

    stage('Build & Run Containers') {
      steps {
        script {
          // Ensure the correct environment variables are passed to docker-compose
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

pipeline {
  agent any

  // All of these are injected by Jenkins from your "Global properties → Environment variables"
  environment {
    COMPOSE_FILE            = 'docker-compose.yml'
    MONGO_URI               = "${MONGO_URI}"
    JWT_SECRET              = "${JWT_SECRET}"
    USE_CLOUDINARY          = "${USE_CLOUDINARY}"
    CLOUDINARY_CLOUD_NAME   = "${CLOUDINARY_CLOUD_NAME}"
    CLOUDINARY_API_KEY      = "${CLOUDINARY_API_KEY}"
    CLOUDINARY_API_SECRET   = "${CLOUDINARY_API_SECRET}"
  }

  stages {
    stage('Clone Repository') {
      steps {
        git url: 'https://github.com/PavanKumarKR42/mern-social-media-app.git', branch: 'main'
      }
    }

    stage('Free Ports 3000 & 5000') {
      steps {
        sh '''
          for P in 3000 5000; do
            CID=$(docker ps -q --filter "publish=$P")
            if [ -n "$CID" ]; then
              echo "Stopping container on port $P (ID=$CID)..."
              docker stop $CID && docker rm $CID
            else
              echo "No container using port $P."
            fi
          done
        '''
      }
    }

    stage('Build & Run Containers') {
      steps {
        sh 'docker-compose down || true'
        sh 'docker-compose up --build -d'
      }
    }
  }

  post {
    always {
      echo 'Pruning unused Docker resources...'
      sh 'docker system prune -f'
    }
  }
}

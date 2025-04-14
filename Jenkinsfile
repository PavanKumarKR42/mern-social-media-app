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

    stage('Build & Run Containers') {
      steps {
        script {
          sh 'docker-compose down'
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

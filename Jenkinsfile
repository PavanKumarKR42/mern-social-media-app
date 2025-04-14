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

pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    timestamps()
    timeout(time: 90, unit: 'MINUTES')
    disableConcurrentBuilds()
    disableResume()
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '5'))
  }

  environment {
    CI = 'true'
    CI_ENV_FILE = '.env.ci.example'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.CI_TAG = sh(
            script: 'git rev-parse --short=12 HEAD',
            returnStdout: true
          ).trim()
          env.CI_PROJECT_NAME = "smartintern-ci-${env.BUILD_NUMBER}"
        }
      }
    }

    stage('Preflight') {
      steps {
        echo "Branch: ${env.BRANCH_NAME ?: 'detached'}"
        echo "Change request: ${env.CHANGE_ID ?: 'none'}"
        sh 'git rev-parse HEAD'
        sh 'docker version'
        sh 'docker compose version'
      }
    }

    stage('Application CI') {
      parallel {
        stage('Frontend CI') {
          agent {
            docker {
              image 'node:20.19.4-bookworm-slim'
              args '--user 1000:1000 --env HOME=/tmp --env npm_config_cache=/tmp/npm-cache'
              reuseNode true
            }
          }
          steps {
            dir('frontend-web') {
              sh 'node --version && npm --version'
              sh 'npm ci'
              sh 'npm test'
              sh 'npm run build'
            }
          }
        }

        stage('Backend CI') {
          agent {
            docker {
              image 'node:20.19.4-bookworm'
              args '--user 1000:1000 --env HOME=/tmp --env npm_config_cache=/tmp/npm-cache'
              reuseNode true
            }
          }
          steps {
            dir('backend-api') {
              sh 'node --version && npm --version'
              sh 'npm ci'
              sh 'npx --no-install prisma generate'
              sh 'npm test'
            }
          }
        }

        stage('AI Service CI') {
          agent {
            docker {
              image 'python:3.11.9-slim-bookworm'
              args '--user 1000:1000 --env HOME=/tmp'
              reuseNode true
            }
          }
          steps {
            dir('ai-service') {
              sh 'python --version && python -m pip --version'
              sh 'python -m pip install --user --no-cache-dir --requirement requirements.txt'
              sh 'python -m compileall -q app'
              sh 'python -m unittest discover -s tests -p "test*.py"'
            }
          }
        }

        stage('Mobile CI') {
          agent {
            docker {
              image 'node:20.19.4-bookworm-slim'
              args '--user 1000:1000 --env HOME=/tmp --env npm_config_cache=/tmp/npm-cache'
              reuseNode true
            }
          }
          steps {
            dir('mobile-app') {
              sh 'node --version && npm --version'
              sh 'npm ci'
              sh 'npm run lint'
              sh 'npm run typecheck'
              sh 'npx --yes expo-doctor@1.20.1 .'
            }
          }
        }
      }
    }

    stage('Compose Validation') {
      steps {
        sh '''
          export POSTGRES_VOLUME_NAME="${CI_PROJECT_NAME}-postgres-data"
          export BACKEND_UPLOADS_VOLUME_NAME="${CI_PROJECT_NAME}-backend-uploads"
          docker compose -p "${CI_PROJECT_NAME}" --env-file "${CI_ENV_FILE}" config --quiet
        '''
      }
    }

    stage('Docker Build') {
      steps {
        sh '''
          docker build --target runtime -t "smartintern-backend:${CI_TAG}" ./backend-api
          docker build --target migrate -t "smartintern-backend-migrate:${CI_TAG}" ./backend-api
          docker build -t "smartintern-ai:${CI_TAG}" ./ai-service
          docker build \
            --build-arg VITE_API_BASE_URL=/ \
            --build-arg VITE_API_TIMEOUT_MS=15000 \
            -t "smartintern-frontend:${CI_TAG}" \
            ./frontend-web
          docker build -t "smartintern-postgres:${CI_TAG}" ./devops/postgres
        '''
      }
    }

    stage('Compose Smoke Test') {
      steps {
        sh '''
          export IMAGE_TAG="${CI_TAG}"
          export POSTGRES_VOLUME_NAME="${CI_PROJECT_NAME}-postgres-data"
          export BACKEND_UPLOADS_VOLUME_NAME="${CI_PROJECT_NAME}-backend-uploads"

          docker compose -p "${CI_PROJECT_NAME}" --env-file "${CI_ENV_FILE}" \
            up -d --no-build --wait --wait-timeout 180

          docker compose -p "${CI_PROJECT_NAME}" --env-file "${CI_ENV_FILE}" ps -a
          docker compose -p "${CI_PROJECT_NAME}" --env-file "${CI_ENV_FILE}" \
            exec -T postgres pg_isready -U smartintern_ci -d smartintern_ci
          docker compose -p "${CI_PROJECT_NAME}" --env-file "${CI_ENV_FILE}" \
            exec -T postgres psql -U smartintern_ci -d smartintern_ci -Atc \
            "SELECT extname FROM pg_extension WHERE extname = 'vector';"
          docker compose -p "${CI_PROJECT_NAME}" --env-file "${CI_ENV_FILE}" \
            exec -T backend node -e \
            "fetch('http://127.0.0.1:5000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
          docker compose -p "${CI_PROJECT_NAME}" --env-file "${CI_ENV_FILE}" \
            exec -T ai-service python -c \
            "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)"
          docker compose -p "${CI_PROJECT_NAME}" --env-file "${CI_ENV_FILE}" \
            exec -T frontend wget -qO- http://127.0.0.1:8080/health
        '''
      }
    }

    stage('Final Summary') {
      steps {
        echo "CI validation completed for ${env.CI_TAG}. Images were built locally and were not pushed."
      }
    }
  }

  post {
    always {
      script {
        if (env.CI_PROJECT_NAME?.trim() && fileExists(env.CI_ENV_FILE)) {
          sh '''
            export IMAGE_TAG="${CI_TAG}"
            export POSTGRES_VOLUME_NAME="${CI_PROJECT_NAME}-postgres-data"
            export BACKEND_UPLOADS_VOLUME_NAME="${CI_PROJECT_NAME}-backend-uploads"
            docker compose -p "${CI_PROJECT_NAME}" --env-file "${CI_ENV_FILE}" \
              down --volumes --remove-orphans
          '''
        }

        if (env.CI_TAG?.trim()) {
          sh '''
            for image in \
              smartintern-frontend \
              smartintern-backend \
              smartintern-backend-migrate \
              smartintern-ai \
              smartintern-postgres
            do
              if docker image inspect "${image}:${CI_TAG}" >/dev/null 2>&1; then
                docker image rm "${image}:${CI_TAG}"
              fi
            done
          '''
        }
      }
      deleteDir()
    }
    success {
      echo 'SmartIntern AI CI completed successfully.'
    }
    failure {
      echo 'SmartIntern AI CI failed. Review the first failing stage.'
    }
  }
}

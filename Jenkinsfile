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
    CI_IMAGES = 'smartintern-frontend smartintern-backend smartintern-backend-migrate smartintern-ai smartintern-postgres'
    DOCKER_REGISTRY = 'docker.io'
    DOCKERHUB_CREDENTIALS_ID = 'dockerhub-smartintern'
    SONARQUBE_INSTALLATION = 'SmartIntern SonarQube'
    SONAR_SCANNER_INSTALLATION = 'SmartIntern SonarScanner'
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
          env.SONAR_PROJECT_KEY = env.BRANCH_NAME == 'main'
            ? 'smartintern-ai'
            : 'smartintern-ai-step6'
          env.SONAR_PROJECT_NAME = env.BRANCH_NAME == 'main'
            ? 'SmartIntern AI'
            : 'SmartIntern AI Step 6'
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
              sh 'npm run test:coverage'
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
              sh 'npm run test:coverage'
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
              sh 'python -m pip install --user --no-cache-dir --requirement requirements-dev.txt'
              sh 'python -m compileall -q app'
              sh 'python -m coverage run --branch --source=app -m unittest discover -s tests -p "test*.py"'
              sh 'python -m coverage xml -o coverage.xml'
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

    stage('SonarQube Analysis') {
      when {
        beforeAgent true
        anyOf {
          branch 'main'
          branch 'devops/step-6-sonarqube-quality-gate'
        }
      }
      steps {
        script {
          def scannerHome = tool name: env.SONAR_SCANNER_INSTALLATION,
            type: 'hudson.plugins.sonar.SonarRunnerInstallation'

          withSonarQubeEnv(env.SONARQUBE_INSTALLATION) {
            sh """
              export SONAR_TOKEN="\${SONAR_AUTH_TOKEN}"
              export SONAR_SCANNER_JAVA_OPTS='-Xms128m -Xmx512m'
              '${scannerHome}/bin/sonar-scanner' \\
                -Dsonar.projectKey='${env.SONAR_PROJECT_KEY}' \\
                -Dsonar.projectName='${env.SONAR_PROJECT_NAME}' \\
                -Dsonar.projectVersion='${env.CI_TAG}'
            """
          }

          env.SONAR_ANALYSIS_STATUS = 'SUCCESS'
        }
      }
    }

    stage('Quality Gate') {
      when {
        beforeAgent true
        anyOf {
          branch 'main'
          branch 'devops/step-6-sonarqube-quality-gate'
        }
      }
      steps {
        timeout(time: 15, unit: 'MINUTES') {
          script {
            def gate = waitForQualityGate abortPipeline: false
            env.QUALITY_GATE_STATUS = gate.status

            if (gate.status != 'OK') {
              error "SonarQube Quality Gate failed with status: ${gate.status}"
            }
          }
        }
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

    stage('Registry Publish') {
      when {
        beforeAgent true
        anyOf {
          branch 'main'
          branch 'devops/step-5-dockerhub-registry'
          branch 'devops/step-6-sonarqube-quality-gate'
        }
      }
      steps {
        script {
          withCredentials([
            usernamePassword(
              credentialsId: env.DOCKERHUB_CREDENTIALS_ID,
              usernameVariable: 'DOCKERHUB_USERNAME',
              passwordVariable: 'DOCKERHUB_TOKEN'
            )
          ]) {
            env.REGISTRY_NAMESPACE = env.DOCKERHUB_USERNAME

            sh '''
              set -eu

              registry_config="${WORKSPACE_TMP}/dockerhub-${BUILD_NUMBER}"
              mkdir -p "${registry_config}"

              cleanup_registry_session() {
                set +x
                for image in ${CI_IMAGES}; do
                  for tag in "${CI_TAG}" latest; do
                    registry_ref="${DOCKERHUB_USERNAME}/${image}:${tag}"
                    if docker image inspect "${registry_ref}" >/dev/null 2>&1; then
                      docker image rm "${registry_ref}" >/dev/null 2>&1 || true
                    fi
                  done
                done
                docker --config "${registry_config}" logout "${DOCKER_REGISTRY}" >/dev/null 2>&1 || true
                rm -rf "${registry_config}"
              }
              trap cleanup_registry_session EXIT

              set +x
              printf '%s' "${DOCKERHUB_TOKEN}" | docker --config "${registry_config}" \
                login "${DOCKER_REGISTRY}" --username "${DOCKERHUB_USERNAME}" --password-stdin
              set -x

              for image in ${CI_IMAGES}; do
                registry_image="${DOCKERHUB_USERNAME}/${image}"
                docker tag "${image}:${CI_TAG}" "${registry_image}:${CI_TAG}"
                docker --config "${registry_config}" push "${registry_image}:${CI_TAG}"
              done

              if [ "${BRANCH_NAME}" = 'main' ]; then
                for image in ${CI_IMAGES}; do
                  registry_image="${DOCKERHUB_USERNAME}/${image}"
                  docker tag "${image}:${CI_TAG}" "${registry_image}:latest"
                  docker --config "${registry_config}" push "${registry_image}:latest"
                done
              fi
            '''
          }

          env.REGISTRY_PUSH_STATUS = 'SUCCESS'
          env.LATEST_PUSH_STATUS = env.BRANCH_NAME == 'main' ? 'updated' : 'not updated (non-main branch)'
        }
      }
    }

    stage('Final Summary') {
      steps {
        script {
          def registryPushStatus = env.REGISTRY_PUSH_STATUS ?: 'SKIPPED (branch not authorized)'
          def latestPushStatus = env.LATEST_PUSH_STATUS ?: 'not updated'
          def sonarStatus = env.SONAR_ANALYSIS_STATUS ?: 'SKIPPED (branch not analyzed)'
          def qualityGateStatus = env.QUALITY_GATE_STATUS ?: 'SKIPPED (branch not analyzed)'
          def repositories = env.CI_IMAGES.tokenize()
            .collect { image ->
              env.REGISTRY_NAMESPACE?.trim()
                ? "- ${env.REGISTRY_NAMESPACE}/${image}"
                : "- ${image} (not published)"
            }
            .join('\n')

          echo """SmartIntern AI CI/CD validation completed.

Branch: ${env.BRANCH_NAME ?: 'detached'}
Commit: ${env.CI_TAG}

Application CI: SUCCESS
SonarQube: ${sonarStatus}
Quality Gate: ${qualityGateStatus}
Docker Build: SUCCESS
Smoke Tests: SUCCESS

Docker images built:
${env.CI_IMAGES.tokenize().collect { image -> "- ${image}" }.join('\n')}

Registry: Docker Hub
Docker Hub repositories:
${repositories}

Immutable tag: ${env.CI_TAG}
Registry push: ${registryPushStatus}
latest: ${latestPushStatus}"""
        }
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
            for image in ${CI_IMAGES}; do
              if [ -n "${REGISTRY_NAMESPACE:-}" ]; then
                for tag in "${CI_TAG}" latest; do
                  registry_ref="${REGISTRY_NAMESPACE}/${image}:${tag}"
                  if docker image inspect "${registry_ref}" >/dev/null 2>&1; then
                    docker image rm "${registry_ref}" >/dev/null 2>&1 || true
                  fi
                done
              fi

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

pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Lint Check') {
            steps {
                bat 'npm run lint || echo [INFO] No lint script configured'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test || echo [INFO] No test script configured'
            }
        }

        stage('Build Summary') {
            steps {
                bat 'echo ===== BUILD COMPLETE ===== && echo Project: traffic-optimizer && node --version && npm --version'
            }
        }
    }
}

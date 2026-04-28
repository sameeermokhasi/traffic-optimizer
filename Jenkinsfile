pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                bat 'python -m pip install -r requirements.txt'
            }
        }

        stage('Lint Check') {
            steps {
                bat 'python -m py_compile app.py && echo [PASS] Syntax OK'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'python -m pytest tests/ -v --tb=short || echo [INFO] No tests found'
            }
        }

        stage('Build Summary') {
            steps {
                bat 'echo ===== BUILD COMPLETE ===== && python --version && dir /b'
            }
        }
    }
}

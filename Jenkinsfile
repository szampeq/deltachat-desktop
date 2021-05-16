  pipeline {

    agent {
        docker { image 'node:latest' }
    }
    stages{

        stage('Build'){

            steps{
                checkout scm
                echo "Building..."
                sh 'npm i'
                sh 'npm run build'
                }
            }


        stage('Test') {
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps{
                echo 'Start testing'
                sh 'npm run test'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deployment'
                sh 'docker build -t deploy -f Dockerfile-Deploy .'
            }            
        }

    }


    post {

        success {
            emailext attachLog: true, 
                body: "Build status: ${currentBuild.currentResult}", 
                subject: 'Build success', 
                to: 'krzyszt.gac@gmail.com'
        }

        failure {
            emailext attachLog: true, 
                body: "Build status: ${currentBuild.currentResult}",
                subject: 'Build failed', 
                to: 'krzyszt.gac@gmail.com'
        }
    }
}

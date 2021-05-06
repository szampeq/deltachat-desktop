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
    }


    post {

        success {
            emailext attachLog: true, 
                body: "Test status: ${currentBuild.currentResult}", 
                subject: 'Test passed', 
                to: 'krzyszt.gac@gmail.com'
        }

        failure {
            emailext attachLog: true, 
                body: "Test status: ${currentBuild.currentResult}",
                subject: 'Test failed', 
                to: 'krzyszt.gac@gmail.com'
        }
    }
}

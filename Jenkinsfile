  pipeline {

    agent any
    stages{

        stage('Build'){

            steps{
                echo "Building..."
                sh 'npm i'
                sh 'npm run build'
                }
            }


        stage('Test') {
            when {
                expression {currentBuild.result == 'SUCCESS'}
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

  pipeline {

    agent any
    stages{

        stage('Build'){

            steps{
                echo "Building..."
                }
            }


        stage('Test') {

            steps{
                echo 'Start testing...'
                dir('Grupy/Grupa07/KG306533/Lab07/Docker'){
                    sh 'npm test'
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

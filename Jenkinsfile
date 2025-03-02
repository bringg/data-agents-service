#!groovy
@Library('ci-scripts') _

def dockerImage

pipeline {
    agent any

    stages {
        stage('Dependencies') {
            agent {
                dockerfile { filename 'Dockerfile.ci'; reuseNode true }
            }

            steps {
                withCredentials([string(credentialsId: 'npm-bringg', variable: 'NPM_TOKEN')]) {
                    writeFile file: '.npmrc', text: "//registry.npmjs.org/:_authToken=${env.NPM_TOKEN}"
                }

                sh 'npm ci'
                sh 'npm run build'
                sh 'npm run prettier-check'
                sh 'npm run eslint-check'
                sh 'npm run ts-check'
            }
        }

        stage('Docker Image') {
            steps {
                script {
                    dockerImage = dockerUtils.build(
                        args: "--build-arg BUILD_TAG=${env.BUILD_TAG} --build-arg DEPLOY_ENV=${getDeployEnv()} --build-arg REVISION=${env.GIT_COMMIT} --secret id=npmrc,src=.npmrc ."
                    )
                }
            }
        }

        // WE DONT HAVE TESTS YET
        // stage('Tests') {
        //     when { // allow to skip all tests
        //         expression { !getGit.lastCommitSubject().contains('[skip tests]') }
        //     }

        //     parallel {
        //         stage('Unit') {
        //             environment {
        //                 CODECOV_TOKEN = '43c7bf34-f7cf-46b0-9105-e323690a79c9'
        //                 PGDATABASE    = 'postgres'
        //                 PGPASSWORD    = 'postgres'
        //                 PGUSER        = 'postgres'
        //             }

        //             steps {
        //                 // Build local configuration for tests using the configuration-service cli
        //                 buildServiceTestConfig(getRepoName(), "nodejs")

        //                 withServices { service, network ->
        //                     script {
        //                         service(withServices.SVC_POSTGRES)
        //                         service(withServices.SVC_REDIS)
        //                         sleep 5 // making sure all of the above booted
        //                     }

        //                     // prepare DB for tests
        //                     setupHagmoniaDb(network, 'production')

        //                     withDockerfile(file: 'Dockerfile.ci', args: "--net ${network}") {
        //                         sh 'npm test -- --coverage --forceExit'
        //                     }
        //                 }
        //             }

        //             post {
        //                 success {
        //                     codecov()
        //                 }

        //                 always {
        //                     junit(testResults: 'junit*.xml', allowEmptyResults: true)

        //                     withCiScripts() {
        //                         sh 'utils.sh junit2es --debug --xml junit.xml || true'
        //                     }                          
        //                 }
        //             }
        //         }

        //         // stage('Integration') {
        //         //     steps {
        //         //         integrationTests('AllTests', [
        //         //             'microsvc.insights_side_car_service_image_tag': "${dockerUtils.getImageTag(dockerImage.id)}"
        //         //         ])
        //         //     }
        //         // }

        //         stage('SAST') {
        //             when { changeRequest() }

        //             steps {
        //                 mendsast(
        //                     engines: [mendsast.ENGINES.typeScript],
        //                     exclude: ['.github/', 'config/', 'test/', 'dist/', 'node_modules/']
        //                 )
        //             }
        //         }
        //     }
        // }

        stage('Debug') {
            steps {
                echo "Current branch: ${env.BRANCH_NAME}"
            }
        }
        
        stage('Deploy') {
            when {
                anyOf { branch 'master'; branch 'staging' }
            }

            environment {
                AIRBRAKE_PROJECT_ID  = 612794
                AIRBRAKE_PROJECT_KEY = '58bd22ec88282bf529e10e6226281dbc'
                DOCKER_REPO = "${dockerUtils.getImageRepo(dockerImage.id)}"
            }

            steps {
                deployService()
            }
        }
    }

    post {
        always {
            slackBuildSummary()
        }
    }
}

#!groovy

@Library('jenkins-shared-library@k8s-v1.2.1') _

// Deployment config for monorepo apps
def monorepoApps = [
    "central-ui": [
        host: "https://static.central.vioc.com",
        s3Bucket: "vioc-central-ui-dev-static",
        ecrRegistry: "182061158367.dkr.ecr.us-east-1.amazonaws.com/vioc-central-ui"
    ]
]

def monorepoAppsVersion = [:]

/**
Kubernetes YAML breakdown
Each container resource requests contribute to the overall pod resource request.
Since we aren't doing anything parallel no two containers should be running something simultaneously, so each
container is allowed to burst up to the pod total request.
node container:
    Uses docker provided node image
    Runs node needed for building/testing etc angular apps and libs
    Cat command run with tty true to keep container alive
aws cli container:
    Custom aws cli container
    Contains aws cli using ec2 metadata for authorization
kaniko:
    Uses google Kaniko container for building docker images
    Other solutions require hacking around to get access to kubernetes docker daemon or running docker in docker
    Have to use debug image to get access to command line to run cat to keep container alive
    Mounts docker config which is a configmap in kubernetes that configures kaniko to use ecr credential provider for pushing to ecr
**/
pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  automountServiceAccountToken: false
  containers:
  - name: node
    image: cypress/base:12.16.2
    resources:
      requests:
        memory: "2048M"
        cpu: "500m"
      limits:
        memory: "2560M"
        cpu: "1.5"
    command:
    - cat
    tty: true
    env:
    - name: NODE_OPTIONS
      value: --max_old_space_size=2048
  - name: aws-cli
    image: 182061158367.dkr.ecr.us-east-1.amazonaws.com/vioc-aws-cli:0.0.0-aws2
    resources:
      requests:
        memory: "128M"
        cpu: "250m"
      limits:
        memory: "256M"
        cpu: "1.5"
    command:
    - cat
    tty: true
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug-v0.19.0
    resources:
      requests:
        memory: "256M"
        cpu: "500m"
      limits:
        memory: "512M"
        cpu: "1.5"
    command:
    - /busybox/cat
    tty: true
    volumeMounts:
      - name: docker-config
        mountPath: /kaniko/.docker/
  - name: trivy
    image: aquasec/trivy:0.11.0
    resources:
      requests:
        memory: "256M"
        cpu: "100m"
      limits:
        memory: "1024M"
        cpu: "1.5"
    command:
    - cat
    tty: true
  - name: crane
    image: 182061158367.dkr.ecr.us-east-1.amazonaws.com/vioc-crane:latest
    resources:
      requests:
        memory: "256M"
        cpu: "100m"
      limits:
        memory: "1024M"
        cpu: "1.5"
    command:
    - cat
    tty: true
  volumes:
    - name: docker-config
      configMap:
        name: docker-config
'''
        }
    }
    options {
        buildDiscarder(logRotator(numToKeepStr: '100'))
        disableConcurrentBuilds()
    }
    stages {
        stage('Environment') {
            steps {
                container('node') {
                    getTFSVariables()
                    updateTFSBuildStatus('Pending')
                    sh "npm ci --prefer-offline --no-audit"
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Environment' }
                }
            }
        }
        stage('Tests') {
            steps {
                container('node') {
                    script {
                        def testCommand = "npm run jenkins:affected:test -- ${getAffectedBase()} --ci --reporters=jest-junit --runInBand"
                        if (isDevelop()) {
                            // only need code coverage if it's develop
                            testCommand += " --code-coverage"
                        }
                        // Do to resource requests not running anything parallel because we don't have cpu power to support
                        def testExitCode = sh returnStatus: true, script: testCommand
                        if (testExitCode != 0) {
                            currentBuild.result = 'UNSTABLE'
                        }
                        if (isDevelop()) {
                            try {
                                // merge the lcov reports into one for sonarqube
                                sh "npm run merge-coverage"
                            } catch (Exception e) {
                                echo e.getMessage()
                                echo "Error merging code-coverage reports, this may be due to not having any tests run"
                            }
                        }
                    }
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Tests' }
                }
                unstable {
                    script { env.BUILD_FAILURE_STAGE = 'Tests' }
                }
                always {
                    script {
                        // Allowing empty results because it is a possibility that no tests will be run
                        junit allowEmptyResults: true, testResults: 'junit/**/*.xml'
                    }
                }
            }
        }
        stage('Lint') {
            steps {
                container('node') {
                    sh "npm run jenkins:affected:lint -- ${getAffectedBase()}"
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Lint' }
                }
            }
        }
        stage('Format') {
            steps {
                container('node') {
                    sh "npm run jenkins:format:check -- ${getAffectedBase()}"
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Format' }
                }
            }
        }
        stage('Audit') {
            steps {
                container('node') {
                    script {
                        def auditOutput = sh returnStdout: true, script: "npm audit --json || exit 0"
                        def auditOutputJson = readJSON text: auditOutput.trim()
                        def fixableVulnerabilities = hasFixableVulernabilities(auditOutputJson.actions)
                        def reportString = "<h2>NPM Audit</h2>"
                        for (key in auditOutputJson.advisories.keySet()) {
                            echo key
                            reportString += buildAdvisoryHTML(auditOutputJson.advisories[key])
                            reportString += "<br>"
                        }
                        rtp nullAction: '1', parserName: 'HTML', stableText: reportString
                        if (fixableVulnerabilities) {
                            error "Fixable dependency vulnerabilities"
                        } else if (auditOutputJson.metadata.vulnerabilities.critical > 0) {
                            error "Critical vulnerabilities"
                        }
                    }
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Audit' }
                }
            }
        }
        stage('Sonar') {
            when {
                expression {isDevelop()}
            }
            steps {
                script {
                    // determine the last successful build to create proper leak period in SonarQube
                    def sonarId = env.BUILD_ID
                    def build = currentBuild.previousBuild
                    while (build != null) {
                        if (build.result == "SUCCESS") {
                            sonarId = (build.id as Integer) + 1
                            break
                        }
                        build = build.previousBuild
                    }
                    container('node') {
                        withSonarQubeEnv('SonarQube') {
                            sh "npm run sonar-scanner -- -Dsonar.projectVersion=${sonarId} -Dsonar.typescript.tsconfigPath=tsconfig.base.json -Dsonar.ws.timeout=120"
                        }
                    }
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Sonar' }
                }
            }
        }
        stage ('Quality Gate') {
            when {
                expression {isDevelop()}
            }
            steps {
                qualityGate()
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Quality Gate' }
                }
            }
        }
        stage('Build') {
            steps {
                container('node') {
                    sh "npm run jenkins:affected:build -- ${getAffectedBase()} --configuration=deploy --subresource-integrity"
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Build' }
                }
            }
        }
        stage('Container Build') {
            when {
                anyOf {
                    expression {isDevelop()}
                    expression {isHotfix()}
                }
                expression {currentBuild.resultIsBetterOrEqualTo('SUCCESS')}
                expression {env.GIT_COMMIT != env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}
            }
            steps {
                script {
                    container('node') {
                        // Identify which apps were built, --silent and --plain needed to get easily parsable data
                        env.APPS = sh returnStdout: true, script: "npm run --silent jenkins:affected:apps -- ${getAffectedBase()} --plain"
                    }
                    if (env.APPS.trim()) {
                        def deployDate = new Date()
                        def formattedDeployDate = deployDate.format("yyyyMMdd'T'HHmmss")
                        env.BUILD_ID = "${formattedDeployDate}-${env.GIT_COMMIT.substring(0,5)}"
                        for (app in env.APPS.split(" ")) {
                            def appName = app.trim()
                            monorepoAppsVersion[appName] = env.BUILD_ID
                            container('aws-cli') {
                                // Publish the static app contents to the configured s3 bucket
                                sh "aws s3 cp dist/apps/${appName} s3://${monorepoApps[appName].s3Bucket}/${env.BUILD_ID} --recursive --cache-control public,max-age=604800,immutable --profile aws_k8s"
                            }
                            container('kaniko') {
                                // Trigger docker build and publish to configure ecr registry
                                sh "/kaniko/executor --context=dir://${env.WORKSPACE}/apps/${appName} --build-arg APP_HOST=${monorepoApps[appName].host} --build-arg APP_VERSION=${env.BUILD_ID} --destination=${monorepoApps[appName].ecrRegistry}:${env.BUILD_ID} --whitelist-var-run=false --no-push --tarPath=./${appName}.tar"
                            }
                        }
                    }
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Container Build' }
                }
            }
        }
        stage('Container Scan') {
            when {
                anyOf {
                    expression {isDevelop()}
                    expression {isHotfix()}
                }
                expression {currentBuild.resultIsBetterOrEqualTo('SUCCESS')}
                expression {env.GIT_COMMIT != env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}
            }
            steps {
                script {
                    if (env.APPS.trim()) {
                        for (app in env.APPS.split(" ")) {
                            def appName = app.trim()
                            container('trivy') {
                                def fileName = "trivy-${appName}.json"
                                sh script: "trivy image --input ${appName}.tar -f json -o ${fileName} --no-progress"
                                parseTrivyJson(fileName, "HIGH")
                            }
                        }
                    }
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Container Scan' }
                }
            }
        }
        stage('Publish Contracts') {
            when {
                anyOf {
                    expression {isDevelop()}
                    expression {isHotfix()}
                }
                expression {currentBuild.resultIsBetterOrEqualTo('SUCCESS')}
                expression {env.GIT_COMMIT != env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}
            }
            steps {
                container('node') {
                    // install needed tools
                    sh "apt-get update -y"
                    sh "apt-get install jq -y"
                    // run all the api tests
                    sh "npm run nx -- run-many --target=test --projects=\$(cat nx.json | jq .projects | jq keys | grep data-access | tr -d '[:space:]\"' | sed 's/,*\$//g') --testPathPattern=.*api.spec.ts"
                    script {
                        withCredentials([usernamePassword(credentialsId: config.getParam('pactWriteCredential'), 
                            passwordVariable: 'PACT_BROKER_PASS', usernameVariable: 'PACT_BROKER_USER')]) {
                                withEnv(["PACT_BROKER_SERVER=${config.getParam('pactUrl')}"]) {
                                    sh 'npm run pact:publish -- -b=$PACT_BROKER_SERVER -a=$BUILD_ID -u=$PACT_BROKER_USER -p=$PACT_BROKER_PASS'
                                }
                        }
                    }
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Publish Contracts' }
                }
            }
        }
        stage('Dev Deploy') {
            when {
                anyOf {
                    expression {isDevelop()}
                    expression {isHotfix()}
                }
                expression {currentBuild.resultIsBetterOrEqualTo('SUCCESS')}
                expression {env.GIT_COMMIT != env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}
            }
            steps {
                script {
                    if (env.APPS.trim()) {
                        container('node') {
                            sh "curl -sSL -o /usr/local/bin/argocd https://${config.getParam('argoDevServer')}/download/argocd-linux-amd64 && chmod +x /usr/local/bin/argocd"
                        }
                        for (app in apps.split(" ")) {
                            def appName = app.trim()
                            container('crane') {
                                sh "crane push ${appName}.tar ${monorepoApps[appName].ecrRegistry}:${env.BUILD_ID}"
                            }
                            // Dev deployment of newly created container
                            k8sDeploy("vioc-${appName}", env.BUILD_ID)
                            withCredentials([string(credentialsId: config.getParam('argoDevSyncCredential'), variable: 'ARGOCD_AUTH_TOKEN')]) {
                                withEnv(["ARGOCD_SERVER=${config.getParam('argoDevServer')}"]) {
                                    container('node') {
                                        def syncExitCode = sh returnStatus: true, script: "argocd app sync vioc-${appName} --grpc-web"
                                        if (syncExitCode != 0) {
                                            echo "Sync returned exit code ${syncExitCode}, assuming this is because sync is currently running, view logs above for additional details"
                                        }
                                        timeout(10) {
                                            sh "argocd app wait vioc-${appName} --grpc-web"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'Dev Deploy' }
                }
            }
        }
        stage("E2E") {
            when {
                anyOf {
                    expression {isDevelop()}
                    expression {isHotfix()}
                }
                expression {currentBuild.resultIsBetterOrEqualTo('SUCCESS')}
                expression {env.GIT_COMMIT != env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}
            }
            steps {
                container('node') {
                    script {
                        def testCommand = "npm run jenkins:affected:e2e -- ${getAffectedBase()} --headless -- --configuration=jenkins"
                        // Do to resource requests not running anything parallel because we don't have cpu power to support
                        def testExitCode = sh returnStatus: true, script: testCommand
                        if (testExitCode != 0) {
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
            post {
                failure {
                    script { env.BUILD_FAILURE_STAGE = 'E2E' }
                }
                unstable {
                    script { env.BUILD_FAILURE_STAGE = 'E2E' }
                }
                always {
                    script {
                        // Allowing empty results because it is a possibility that no tests will be run
                        junit allowEmptyResults: true, testResults: 'test-reports/test-output-*.xml'
                    }
                }
            }
        }
        // stage('QA Deploy') {
        //     when {
        //         anyOf {
        //             expression {isDevelop()}
        //             expression {isHotfix()}
        //         }
        //         expression {currentBuild.resultIsBetterOrEqualTo('SUCCESS')}
        //         expression {env.GIT_COMMIT != env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}
        //     }
        //     steps {
        //         script {
        //             monorepoAppsVersion.each { entry ->
        //                 k8sDeploy("vioc-${entry.key}", entry.value, "qa")
        //             }
        //         }
        //     }
        //     post {
        //         failure {
        //             script { env.BUILD_FAILURE_STAGE = 'QA Deploy' }
        //         }
        //     }
        // }
    }
    post {
        success {
            updateTFSBuildStatus('Succeeded')
        }
        failure {
            emailCulprits()
            updateTFSBuildStatus('Failed')
        }
        unstable {
            emailCulprits()
            updateTFSBuildStatus('Failed')
        }
        aborted {
            emailCulprits()
            updateTFSBuildStatus('Error')
        }
    }
}

def getAffectedBase() {
    if (isDevelop()) {
        if (env.GIT_PREVIOUS_SUCCESSFUL_COMMIT) {
            // Run everything since the last successful build to ensure any failures are caught
            return "--base=${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}"
        } else {
            // This should only happen when the build is first created
            return "--all"
        }
    } else {
        // Non develop, run against develop
        return "--base=origin/develop"
    }
}

def hasFixableVulernabilities(actions) {
    for (action in actions) {
        if (action.action == "install" || action.action == "update") {
            for (resolution in action.resolves) {
                if (!resolution.dev) {
                    return true
                }
            }
        }
    }
    return false
}

def buildAdvisoryHTML(advisory) {
    return "<h3>${advisory.title}</h3>" +
        "<b>Module:</b> ${advisory.module_name}<br>" +
        "<b>Overview:</b> ${advisory.overview}<br>" +
        "<b>Recommendation:</b> ${advisory.recommendation}<br>" +
        "<b>Vulnerable:</b> ${advisory.vulnerable_versions}<br>" +
        "<b>Patched:</b> ${advisory.patched_versions}<br>" +
        "<b>Severity:</b> ${advisory.severity}<br>" +
        "<b>Link:</b> <a href=\"${advisory.url}\">${advisory.url}</a><br>" +
        buildFindingsHTML(advisory.findings)
}

def buildFindingsHTML(findings) {
    def findingsString = "<b>Findings:</b><ul>"
    for (finding in findings) {
        findingsString += "<li>${finding.version}<ul>"
        for (path in finding.paths) {
            findingsString += "<li>${path}</li>"
        }
        findingsString += "</ul></li>"
    }
    findingsString += "</ul>"
    return findingsString
}

def isHotfix() {
    return env.GIT_BRANCH.matches(~/hotfix\/.*/)
}

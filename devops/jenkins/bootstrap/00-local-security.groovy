import groovy.json.JsonSlurper
import hudson.security.FullControlOnceLoggedInAuthorizationStrategy
import hudson.security.HudsonPrivateSecurityRealm
import jenkins.model.Jenkins
import jenkins.model.JenkinsLocationConfiguration

// Runtime-only input: never bake credentials into an image or commit them.
def input = new File('/run/smartintern-bootstrap/secrets.json')
if (!input.isFile()) throw new IllegalStateException('Missing private local bootstrap file')
def secrets = new JsonSlurper().parse(input)
def instance = Jenkins.get()
def realm = instance.securityRealm instanceof HudsonPrivateSecurityRealm
  ? instance.securityRealm : new HudsonPrivateSecurityRealm(false)
if (hudson.model.User.getById('admin', false) == null) realm.createAccount('admin', secrets.jenkinsAdminPassword)
instance.securityRealm = realm
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.allowAnonymousRead = false
instance.authorizationStrategy = strategy
instance.numExecutors = 1
JenkinsLocationConfiguration.get().url = 'http://localhost:8090/'
instance.save()
println 'SmartIntern local security initialized; anonymous access disabled, one executor.'

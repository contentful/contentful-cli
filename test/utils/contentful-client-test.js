import test from 'ava'
import sinon from 'sinon'
import version from '../../version'
import { createManagementClient, __RewireAPI__ as rw } from '../../lib/utils/contentful-clients'

test.only('set the correct application name and version', (t) => {
  const rewiredCreateClient = sinon.stub()
  rw.__Rewire__('createClient', rewiredCreateClient)
  createManagementClient({accessToken: 'accessToken'})
  t.truthy(rewiredCreateClient.args[0][0].application.match(new RegExp(`contentful-cli/${version}`, 'g')))
  t.is(rewiredCreateClient.callCount, 1)
})

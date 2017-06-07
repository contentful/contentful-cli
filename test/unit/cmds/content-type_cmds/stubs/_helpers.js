import Bluebird from 'bluebird'
import sinon from 'sinon'

import * as helpers from '../../../../../lib/core/patch/helpers/helpers'

export default function () {
  return {
    applyPatch: sinon.spy(helpers.applyPatch),
    confirmPatch: sinon.stub().returns(Bluebird.resolve(true)),
    confirm: sinon.stub().returns(Bluebird.resolve(true)),
    prettyDiff: sinon.stub(),
    hasChanged: sinon.spy(helpers.hasChanged),
    transformPath: helpers.transformPath
  }
}

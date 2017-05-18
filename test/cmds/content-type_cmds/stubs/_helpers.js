import Bluebird from 'bluebird'
import sinon from 'sinon'

import { applyPatch, transformPath } from '../../../../lib/cmds/content-type_cmds/patch/helpers'

export default function () {
  return {
    applyPatch: sinon.spy(applyPatch),
    confirmPatch: sinon.stub().returns(Bluebird.resolve(true)),
    prettyDiff: sinon.stub(),
    transformPath
  }
}
